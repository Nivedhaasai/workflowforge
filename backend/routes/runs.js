const express = require('express');
const authMiddleware = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const Run = require('../models/Run');
const { resumeAfterApproval } = require('../services/workflowRunner');

const router = express.Router();

// GET /api/runs - List all runs for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const runs = await Run.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('workflow', 'name')
      .lean();

    const summaries = runs.map(r => ({
      id: r._id,
      workflow: r.workflow ? { id: r.workflow._id, name: r.workflow.name } : { id: r.workflow },
      status: r.status,
      error: r.error || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      durationMs: r.durationMs || (r.updatedAt && r.createdAt ? new Date(r.updatedAt) - new Date(r.createdAt) : null),
      stepCount: (r.steps || []).length,
    }));

    return res.status(200).json(summaries);
  } catch (error) {
    console.error('List runs error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/runs/:runId/approve - Approve or reject an approval step
router.post('/:runId/approve', authMiddleware, async (req, res) => {
  try {
    const { runId } = req.params;
    const { decision, comment } = req.body;

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "approved" or "rejected"' });
    }

    const run = await Run.findById(runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    if (run.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    if (run.status !== 'waiting_approval') {
      return res.status(400).json({ error: 'Run is not waiting for approval' });
    }

    // Resume the workflow - fire and forget
    resumeAfterApproval(runId, decision, comment || '', req.user.email)
      .catch(err => console.error('Resume after approval error:', err.message));

    return res.status(200).json({ message: `Approval ${decision}`, runId });
  } catch (error) {
    console.error('Approve run error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/runs/:runId - Get run details (owner only)
router.get('/:runId', authMiddleware, async (req, res) => {
  try {
    const { runId } = req.params;
    const run = await Run.findById(runId).lean();
    if (!run) return res.status(404).json({ error: 'Run not found' });
    if (run.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    let workflowInfo = { id: run.workflow };
    try {
      const wf = await Workflow.findById(run.workflow).select('name').lean();
      if (wf) workflowInfo.name = wf.name;
    } catch (e) { /* ignore */ }

    return res.status(200).json({
      id: run._id,
      workflow: workflowInfo,
      status: run.status,
      error: run.error || null,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      durationMs: run.durationMs || (run.updatedAt && run.createdAt ? new Date(run.updatedAt) - new Date(run.createdAt) : null),
      steps: run.steps || [],
      auditLog: run.auditLog || [],
      currentNodeIndex: run.currentNodeIndex || 0,
    });
  } catch (error) {
    console.error('Get run error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
