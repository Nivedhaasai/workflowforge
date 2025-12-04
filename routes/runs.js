const express = require('express');
const authMiddleware = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const Run = require('../models/Run');

const router = express.Router();

// Execute a single node based on its type
async function executeNode(node) {
  const { type, config } = node;

  switch (type) {
    case 'text':
      // Return text content
      return config.content || '';

    case 'delay':
      // Wait for specified milliseconds
      const ms = config.ms || 0;
      await new Promise((resolve) => setTimeout(resolve, ms));
      return 'done';

    case 'http':
      // Make HTTP GET request
      const url = config.url;
      if (!url) {
        throw new Error('http node requires config.url');
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }

    default:
      throw new Error(`Unsupported node type: ${type}`);
  }
}

// POST /api/runs/:workflowId/run - Execute a workflow
router.post('/:workflowId/run', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;

    // Lookup workflow
    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Verify ownership
    if (workflow.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      return res.status(400).json({ error: 'Workflow has no nodes to execute' });
    }

    const results = [];
    let runStatus = 'success';
    let runError = null;

    // Execute nodes sequentially
    for (const node of workflow.nodes) {
      try {
        const output = await executeNode(node);

        results.push({
          nodeId: node.id,
          type: node.type,
          status: 'success',
          output,
          error: null,
        });
      } catch (error) {
        // Node execution failed
        results.push({
          nodeId: node.id,
          type: node.type,
          status: 'failed',
          output: null,
          error: error.message,
        });

        // Mark run as failed and stop execution
        runStatus = 'failed';
        runError = `Node ${node.id} (${node.type}) failed: ${error.message}`;
        break;
      }
    }

    // Save run to database
    const run = new Run({
      workflow: workflow._id,
      owner: req.user.id,
      status: runStatus,
      error: runError,
      results,
    });

    await run.save();

    return res.status(200).json(run);
  } catch (error) {
    console.error('Run workflow error:', error.message);
    try {
      const fs = require('fs');
      fs.appendFileSync('server-errors.log', `RUN ERROR: ${new Date().toISOString()}\n${error.stack}\n\n`);
    } catch (e) {
      console.error('Failed to write server error log:', e.message);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/runs/:runId - Get run details (owner only)
router.get('/:runId', authMiddleware, async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await Run.findById(runId).lean();
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    if (run.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Optionally include workflow name
    let workflowInfo = { id: run.workflow };
    try {
      const wf = await Workflow.findById(run.workflow).select('name').lean();
      if (wf) workflowInfo.name = wf.name;
    } catch (e) {
      // ignore
    }

    const response = {
      id: run._id,
      workflow: workflowInfo,
      status: run.status,
      error: run.error || null,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      durationMs: run.updatedAt && run.createdAt ? new Date(run.updatedAt) - new Date(run.createdAt) : null,
      results: run.results || [],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Get run error:', error.message);
    try { const fs = require('fs'); fs.appendFileSync('server-errors.log', `RUN GET ERROR: ${new Date().toISOString()}\n${error.stack}\n\n`); } catch (e) {}
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
