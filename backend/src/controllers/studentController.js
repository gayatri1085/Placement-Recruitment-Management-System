const Student = require('../models/Student');

// GET /students
exports.getStudents = async (req, res) => {
  try {
    const { department, cgpaMin, status, page = 1, limit = 10, search } = req.query;
    const filter = {};
    if (department) filter.department = department.toUpperCase();
    if (cgpaMin) filter.cgpa = { $gte: parseFloat(cgpaMin) };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /students/:id
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, message: 'Student fetched successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
