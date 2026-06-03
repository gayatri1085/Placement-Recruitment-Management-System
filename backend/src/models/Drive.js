const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    driveId: { type: String, required: true, unique: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
    location: { type: String, trim: true },
    registrationDeadline: { type: Date, required: true },
    rounds: [{ type: String, trim: true }],
    status: { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drive', driveSchema);
