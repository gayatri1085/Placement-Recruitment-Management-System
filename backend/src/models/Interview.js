const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    interviewId: { type: String, required: true, unique: true, trim: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    interviewer: { type: String, trim: true },
    round: { type: String, required: true, trim: true },
    interviewDate: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
