const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    package: { type: Number, required: true },
    eligibleDepartments: [{ type: String, trim: true, uppercase: true }],
    minimumCgpa: { type: Number, required: true, min: 0, max: 10 },
    driveDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
