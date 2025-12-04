const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StepSchema = new Schema({
  nodeId: { type: String, required: true },
  status: { type: String, enum: ['running','success','failed'], required: true },
  result: { type: Schema.Types.Mixed },
  error: { type: String },
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { _id: false })

const RunSchema = new Schema({
  workflow: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['running','failed','completed'], default: 'running' },
  error: { type: String, default: null },
  steps: { type: [StepSchema], default: [] },
  durationMs: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Run', RunSchema)
