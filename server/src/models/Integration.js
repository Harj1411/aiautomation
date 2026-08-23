const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true
    },
    isConnected: { type: Boolean, default: false },
    scopes: [{ type: String }],
    encryptedTokens: { type: String, default: '' },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
