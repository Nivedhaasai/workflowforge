const Workflow = require('../models/Workflow')
const Run = require('../models/Run')

// Ensure fetch is available (Node 18+ has native, fallback for older)
const fetch = globalThis.fetch || (() => { throw new Error('fetch is not available — upgrade to Node 18+') })

/**
 * Execute a single node based on its type.
 * @param {Object} node - The node to execute
 * @param {*} previousOutput - Output from the previous node
 * @returns {Object} { output, pauseForApproval }
 */
async function executeNode(node, previousOutput) {
  const { type, config } = node

  switch (type) {
    case 'trigger':
      return { output: { triggered: true, timestamp: new Date().toISOString() } }

    case 'text':
      return { output: config?.content || config?.message || '' }

    case 'delay': {
      const ms = parseInt(config?.ms || (config?.seconds ? config.seconds * 1000 : 1000), 10)
      await new Promise(r => setTimeout(r, Math.min(ms, 60000)))
      return { output: { delayed: ms, timestamp: new Date().toISOString() } }
    }

    case 'http': {
      const url = config?.url
      if (!url) throw new Error('HTTP node requires config.url')
      const method = (config?.method || 'GET').toUpperCase()
      const fetchOptions = { method, headers: { 'Content-Type': 'application/json' } }
      if (method === 'POST' && config?.body) {
        try {
          fetchOptions.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body)
        } catch (e) {
          fetchOptions.body = config.body
        }
      }
      const res = await fetch(url, fetchOptions)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : await res.text()
      return { output: data }
    }

    case 'condition': {
      const field = config?.field
      const operator = config?.operator || '=='
      const value = config?.value
      let fieldValue = previousOutput

      // Try to extract field from previous output
      if (field && previousOutput && typeof previousOutput === 'object') {
        fieldValue = previousOutput[field]
      }

      let result = false
      const strFieldVal = String(fieldValue ?? '')
      const strValue = String(value ?? '')

      switch (operator) {
        case '==': case 'equals':
          result = strFieldVal === strValue; break
        case '!=': case 'not equals':
          result = strFieldVal !== strValue; break
        case '>': case 'greater than':
          result = Number(fieldValue) > Number(value); break
        case '<': case 'less than':
          result = Number(fieldValue) < Number(value); break
        case 'contains':
          result = strFieldVal.includes(strValue); break
        default:
          result = strFieldVal === strValue
      }

      return { output: { result, branch: result ? 'true' : 'false', field, operator, value, fieldValue } }
    }

    case 'approval': {
      return {
        output: { status: 'pending', assignedTo: config?.assignedTo || '', message: config?.message || 'Approval required' },
        pauseForApproval: true
      }
    }

    case 'transform': {
      const template = config?.template || ''
      const outputKey = config?.outputKey || 'result'
      let resolvedString = template

      // Replace {{placeholders}} with values from previous output
      if (previousOutput && typeof previousOutput === 'object') {
        resolvedString = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return previousOutput[key] !== undefined ? String(previousOutput[key]) : match
        })
      }

      // Also inject timestamp
      resolvedString = resolvedString.replace(/\{\{timestamp\}\}/g, new Date().toISOString())

      return { output: { [outputKey]: resolvedString } }
    }

    default:
      throw new Error(`Unsupported node type: ${type}`)
  }
}

/**
 * Run a workflow sequentially. Supports approval pausing.
 */
async function runWorkflow(workflowId, userId, existingRunId) {
  let run
  if (existingRunId) {
    run = await Run.findById(existingRunId)
  }
  if (!run) {
    run = new Run({ workflow: workflowId, owner: userId, status: 'running', steps: [], auditLog: [] })
    await run.save()
  } else if (run.status !== 'waiting_approval') {
    run.status = 'running'
    run.steps = run.steps || []
    run.auditLog = run.auditLog || []
    run.error = null
    await run.save()
  }

  const startedAt = run.createdAt || new Date()

  // Push audit event helper
  function audit(event, nodeId, actor, details) {
    run.auditLog.push({ timestamp: new Date(), event, nodeId: nodeId || null, actor: actor || 'system', details: details || {} })
  }

  try {
    const workflow = await Workflow.findById(workflowId).lean()
    if (!workflow) throw new Error('Workflow not found')

    const nodes = workflow.nodes || []
    const startIdx = run.currentNodeIndex || 0

    if (startIdx === 0) {
      audit('run_started', null, 'system', { workflowName: workflow.name, totalNodes: nodes.length })
    } else {
      audit('run_resumed', null, 'system', { fromNodeIndex: startIdx })
    }
    await run.save()

    let previousOutput = run.previousOutput || null

    for (let i = startIdx; i < nodes.length; i++) {
      const node = nodes[i]
      const step = { nodeId: node.id, status: 'running', result: null, error: null, startedAt: new Date() }

      // Only push a new step if we're not resuming an existing one
      if (i >= run.steps.length) {
        run.steps.push(step)
      } else {
        run.steps[i].status = 'running'
        run.steps[i].startedAt = new Date()
      }
      await run.save()

      try {
        const { output, pauseForApproval } = await executeNode(node, previousOutput)
        const currentStep = run.steps[i]

        if (pauseForApproval) {
          currentStep.status = 'waiting_approval'
          currentStep.result = output
          currentStep.endedAt = new Date()
          run.status = 'waiting_approval'
          run.currentNodeIndex = i
          run.previousOutput = previousOutput
          audit('approval_requested', node.id, 'system', { assignedTo: node.config?.assignedTo, message: node.config?.message })
          await run.save()
          return run
        }

        currentStep.status = 'success'
        currentStep.result = output
        currentStep.endedAt = new Date()
        previousOutput = output
        run.previousOutput = previousOutput
        run.currentNodeIndex = i + 1
        audit('node_executed', node.id, 'system', { type: node.type, status: 'success' })
        await run.save()
      } catch (err) {
        const currentStep = run.steps[i]
        currentStep.status = 'failed'
        currentStep.error = err.message
        currentStep.endedAt = new Date()
        run.status = 'failed'
        run.error = `Node ${node.id} failed: ${err.message}`
        audit('node_failed', node.id, 'system', { type: node.type, error: err.message })
        await run.save()
        break
      }
    }

    if (run.status !== 'failed' && run.status !== 'waiting_approval') {
      run.status = 'completed'
      audit('run_completed', null, 'system', { totalSteps: run.steps.length })
    }
    run.durationMs = new Date() - new Date(startedAt)
    await run.save()

    return run
  } catch (err) {
    try {
      run.status = 'failed'
      run.error = err.message
      run.durationMs = new Date() - new Date(startedAt)
      audit('run_error', null, 'system', { error: err.message })
      await run.save()
    } catch (e) { /* ignore save error */ }
    throw err
  }
}

/**
 * Resume a workflow after approval decision.
 */
async function resumeAfterApproval(runId, decision, comment, actorEmail) {
  const run = await Run.findById(runId)
  if (!run) throw new Error('Run not found')
  if (run.status !== 'waiting_approval') throw new Error('Run is not waiting for approval')

  const currentIdx = run.currentNodeIndex
  const currentStep = run.steps[currentIdx]

  if (!currentStep) throw new Error('No step found at current index')

  // Update the approval step with the decision
  currentStep.result = {
    ...(currentStep.result || {}),
    decision,
    decidedBy: actorEmail,
    comment: comment || '',
    decidedAt: new Date()
  }
  currentStep.status = 'success'
  currentStep.endedAt = new Date()

  run.auditLog.push({
    timestamp: new Date(),
    event: decision === 'approved' ? 'approval_approved' : 'approval_rejected',
    nodeId: currentStep.nodeId,
    actor: actorEmail,
    details: { decision, comment }
  })

  // Set previous output for the next node to use
  run.previousOutput = currentStep.result
  run.currentNodeIndex = currentIdx + 1
  run.status = 'running'
  await run.save()

  // Continue workflow execution from next node
  const Wf = require('../models/Workflow')
  const workflow = await Wf.findById(run.workflow).lean()
  if (!workflow) throw new Error('Workflow not found')

  return runWorkflow(workflow._id.toString(), run.owner.toString(), run._id.toString())
}

module.exports = { runWorkflow, resumeAfterApproval }
