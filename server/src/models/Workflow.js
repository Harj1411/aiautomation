const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft'
    },
    triggerConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    version: { type: Number, default: 1 },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
