const Workflow = require('../../models/Workflow')
const Run = require('../../models/Run')

async function executeNode(node){
  const { type, config } = node
  switch(type){
    case 'text':
      return config?.content ?? ''
    case 'delay':
      const ms = parseInt(config?.ms || 0, 10)
      await new Promise(r => setTimeout(r, ms))
      return 'done'
    case 'http':
      const url = config?.url
      if(!url) throw new Error('http node requires config.url')
      const res = await fetch(url)
      if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const ct = res.headers.get('content-type') || ''
      if(ct.includes('application/json')) return await res.json()
      return await res.text()
    default:
      throw new Error(`Unsupported node type: ${type}`)
  }
}

/**
 * runWorkflow(workflowId, userId)
 * Executes workflow nodes sequentially and persists a Run document.
 * Returns the saved Run document when finished (or throws on fatal errors).
 */
async function runWorkflow(workflowId, userId, existingRunId){
  // Create or load run document
  let run
  if(existingRunId){
    run = await Run.findById(existingRunId)
  }
  if(!run){
    run = new Run({ workflow: workflowId, owner: userId, status: 'running', steps: [] })
    await run.save()
  } else {
    run.status = 'running'
    run.steps = run.steps || []
    run.error = null
    await run.save()
  }

  const startedAt = new Date()

  try{
    const workflow = await Workflow.findById(workflowId).lean()
    if(!workflow) throw new Error('Workflow not found')

    for(const node of workflow.nodes || []){
      const step = { nodeId: node.id, status: 'running', result: null, error: null, startedAt: new Date() }
      run.steps.push(step)
      await run.save()

      try{
        const output = await executeNode(node)
        // update last step
        const last = run.steps[run.steps.length - 1]
        last.status = 'success'
        last.result = output
        last.endedAt = new Date()
        await run.save()
      }catch(err){
        const last = run.steps[run.steps.length - 1]
        last.status = 'failed'
        last.error = err.message
        last.endedAt = new Date()
        run.status = 'failed'
        run.error = `Node ${node.id} failed: ${err.message}`
        await run.save()
        // stop executing further nodes
        break
      }
    }

    if(run.status !== 'failed') run.status = 'completed'
    run.updatedAt = new Date()
    run.durationMs = new Date() - startedAt
    await run.save()

    return run
  }catch(err){
    try{ run.status = 'failed'; run.error = err.message; run.updatedAt = new Date(); run.durationMs = new Date() - startedAt; await run.save() }catch(e){}
    throw err
  }
}

module.exports = { runWorkflow }
