const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true, uppercase: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    graduationYear: { type: Number, required: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'placed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
