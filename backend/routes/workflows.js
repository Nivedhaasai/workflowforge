const express = require('express');
const authMiddleware = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const Run = require('../models/Run');
const { v4: uuidv4 } = require('uuid');
const templates = require('../templates');

const router = express.Router();
const { runWorkflow } = require('../services/workflowRunner');
const { enqueueRun, isQueueEnabled } = require('../queue/publisher');

// POST /api/workflows - Create a workflow
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'name is required' });

    const workflow = new Workflow({
      name,
      description: description || '',
      owner: req.user.id,
      nodes: [],
    });
    await workflow.save();
    return res.status(201).json(workflow);
  } catch (error) {
    console.error('Create workflow error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workflows/templates - Public: list available templates
router.get('/templates', async (req, res) => {
  try {
    const list = templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      icon: t.icon,
      category: t.category,
      nodeCount: t.nodes.length,
      nodeTypes: t.nodes.map(n => n.type),
    }));
    return res.status(200).json(list);
  } catch (error) {
    console.error('Templates error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/workflows/from-template/:templateId - Clone a template
router.post('/from-template/:templateId', authMiddleware, async (req, res) => {
  try {
    const template = templates.find(t => t.id === req.params.templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const clonedNodes = template.nodes.map(n => ({
      id: uuidv4(),
      type: n.type,
      config: { ...n.config },
    }));

    const workflow = new Workflow({
      name: template.name,
      description: template.description,
      owner: req.user.id,
      nodes: clonedNodes,
    });
    await workflow.save();
    return res.status(201).json(workflow);
  } catch (error) {
    console.error('Clone template error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workflows/dashboard/stats - Dashboard statistics
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [totalWorkflows, totalRuns, runs] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Run.countDocuments({ owner: userId }),
      Run.find({ owner: userId }).sort({ createdAt: -1 }).limit(100).populate('workflow', 'name').lean(),
    ]);

    const successCount = runs.filter(r => r.status === 'completed').length;
    const successRate = totalRuns > 0 ? Math.round((successCount / Math.min(totalRuns, 100)) * 100) : 0;
    const pendingApprovals = runs.filter(r => r.status === 'waiting_approval').length;

    const recentRuns = runs.slice(0, 5).map(r => ({
      id: r._id,
      workflowName: r.workflow?.name || 'Unknown',
      status: r.status,
      createdAt: r.createdAt,
      durationMs: r.durationMs || null,
    }));

    return res.status(200).json({ totalWorkflows, totalRuns, successRate, pendingApprovals, recentRuns });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workflows - List workflows for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const workflows = await Workflow.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(workflows);
  } catch (error) {
    console.error('List workflows error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== NODE-LEVEL CRUD (MUST COME BEFORE GENERIC :id ROUTES) =====

// POST /api/workflows/:workflowId/nodes - Create a new node
router.post('/:workflowId/nodes', authMiddleware, async (req, res) => {
  try {
    const { type, config } = req.body;
    if (!type || type.trim() === '') return res.status(400).json({ error: 'type is required' });

    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const newNode = { id: uuidv4(), type, config: config || {} };
    workflow.nodes.push(newNode);
    workflow.markModified('nodes');
    await workflow.save();
    return res.status(201).json(newNode);
  } catch (error) {
    console.error('Create node error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/workflows/:workflowId/nodes/:nodeId - Update a node
router.put('/:workflowId/nodes/:nodeId', authMiddleware, async (req, res) => {
  try {
    const { type, config } = req.body;
    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const node = workflow.nodes.find(n => n.id === req.params.nodeId);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    if (type !== undefined && type.trim() !== '') node.type = type;
    if (config !== undefined) node.config = config;
    await workflow.save();
    return res.status(200).json(node);
  } catch (error) {
    console.error('Update node error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/workflows/:workflowId/nodes/:nodeId - Delete a node
router.delete('/:workflowId/nodes/:nodeId', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const nodeIndex = workflow.nodes.findIndex(n => n.id === req.params.nodeId);
    if (nodeIndex === -1) return res.status(404).json({ error: 'Node not found' });

    workflow.nodes.splice(nodeIndex, 1);
    workflow.markModified('nodes');
    await workflow.save();
    return res.status(200).json({ message: 'Node deleted successfully' });
  } catch (error) {
    console.error('Delete node error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/workflows/:workflowId/nodes/reorder - Reorder nodes
router.patch('/:workflowId/nodes/reorder', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });

    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const nodeIds = new Set(workflow.nodes.map(n => n.id));
    for (const id of ids) {
      if (!nodeIds.has(id)) return res.status(400).json({ error: `Node with id ${id} not found` });
    }

    workflow.nodes = ids.map(id => workflow.nodes.find(n => n.id === id)).filter(Boolean);
    workflow.markModified('nodes');
    await workflow.save();
    return res.status(200).json(workflow.nodes);
  } catch (error) {
    console.error('Reorder nodes error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/workflows/:id/run - Start a workflow run
router.post('/:id/run', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!workflow.nodes || workflow.nodes.length === 0) return res.status(400).json({ error: 'Workflow has no nodes' });

    const run = new Run({ workflow: workflow._id, owner: req.user.id, status: 'running', steps: [], auditLog: [] });
    await run.save();

    if (isQueueEnabled) {
      try {
        await enqueueRun(workflow._id.toString(), req.user.id, run._id.toString());
        return res.status(202).json({ runId: run._id, status: run.status, queued: true });
      } catch (err) {
        console.error('Queue failed, using in-process runner:', err?.message);
      }
    }

    runWorkflow(workflow._id.toString(), req.user.id, run._id.toString())
      .catch(err => console.error('Background run error:', err.message));

    return res.status(202).json({ runId: run._id, status: run.status, queued: false });
  } catch (error) {
    console.error('Start run error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== GENERIC :id ROUTES (MUST COME AFTER SPECIFIC ROUTES) =====

// GET /api/workflows/:workflowId/runs - List runs for a workflow
router.get('/:workflowId/runs', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const limit = parseInt(req.query.limit, 10) || 20;
    const runs = await Run.find({ workflow: req.params.workflowId, owner: req.user.id })
      .sort({ createdAt: -1 }).limit(limit).lean();

    const summaries = runs.map(r => ({
      id: r._id,
      status: r.status,
      error: r.error || null,
      createdAt: r.createdAt,
      durationMs: r.durationMs || (r.updatedAt && r.createdAt ? new Date(r.updatedAt) - new Date(r.createdAt) : null),
    }));
    return res.status(200).json(summaries);
  } catch (error) {
    console.error('List workflow runs error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workflows/:id - Get a specific workflow
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    return res.status(200).json(workflow);
  } catch (error) {
    console.error('Get workflow error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/workflows/:id - Update a workflow
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    if (name !== undefined && name.trim() !== '') workflow.name = name;
    if (description !== undefined) workflow.description = description;
    await workflow.save();
    return res.status(200).json(workflow);
  } catch (error) {
    console.error('Update workflow error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/workflows/:id - Delete a workflow
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    if (workflow.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await Workflow.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
