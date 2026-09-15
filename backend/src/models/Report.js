const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  inspectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection',
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'docx', 'xlsx']
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId // GridFS ID
  },
  hash: {
    type: String // SHA-256
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  qrToken: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
