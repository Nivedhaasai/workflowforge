const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const NodeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false, timestamps: false }
);

const WorkflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    nodes: [NodeSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workflow', WorkflowSchema);
