const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StepSchema = new Schema({
  nodeId: { type: String, required: true },
  status: { type: String, enum: ['running','success','failed','waiting_approval','skipped'], required: true },
  result: { type: Schema.Types.Mixed },
  error: { type: String },
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { _id: false })

const AuditEntrySchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  nodeId: { type: String, default: null },
  actor: { type: String, default: 'system' },
  details: { type: Schema.Types.Mixed, default: {} }
}, { _id: false })

const RunSchema = new Schema({
  workflow: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['running','failed','completed','waiting_approval'], default: 'running' },
  error: { type: String, default: null },
  steps: { type: [StepSchema], default: [] },
  auditLog: { type: [AuditEntrySchema], default: [] },
  currentNodeIndex: { type: Number, default: 0 },
  previousOutput: { type: Schema.Types.Mixed, default: null },
  durationMs: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Run', RunSchema)
