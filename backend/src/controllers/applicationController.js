const Application = require('../models/Application');
const Student = require('../models/Student');
const Drive = require('../models/Drive');

// POST /applications
exports.createApplication = async (req, res) => {
  try {
    const { applicationId, student: studentId, drive: driveId, currentRound, status } = req.body;
    if (!applicationId || !studentId || !driveId) {
      return res.status(400).json({ success: false, message: 'applicationId, student and drive are required' });
    }
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const drive = await Drive.findById(driveId).populate('company');
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    if (drive.status === 'closed' || drive.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Drive is closed and cannot accept applications' });
    }
    const company = drive.company;
    if (company.minimumCgpa && student.cgpa < company.minimumCgpa) {
      return res.status(400).json({ success: false, message: `Student CGPA ${student.cgpa} is below minimum required ${company.minimumCgpa}` });
    }
    if (company.eligibleDepartments?.length && !company.eligibleDepartments.includes(student.department)) {
      return res.status(400).json({ success: false, message: `Student department ${student.department} is not eligible` });
    }
    const duplicate = await Application.findOne({ student: studentId, drive: driveId });
    if (duplicate) return res.status(409).json({ success: false, message: 'Application already exists for this drive' });
    const application = await Application.create({
      applicationId, student: studentId, drive: driveId,
      currentRound: currentRound || 'Applied',
      status: status || 'applied',
      appliedAt: new Date(),
    });
    res.status(201).json({ success: true, message: 'Application created successfully', data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /applications
exports.getApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let query = Application.find(filter)
      .populate({ path: 'student', select: 'studentId name department email cgpa skills graduationYear phone status' })
      .populate({ path: 'drive', populate: { path: 'company', select: 'companyId name' } })
      .sort({ createdAt: -1 });

    // Apply search on populated results
    let apps = await query;
    if (search) {
      const s = search.toLowerCase();
      apps = apps.filter(a =>
        a.drive?.title?.toLowerCase().includes(s) ||
        a.drive?.company?.name?.toLowerCase().includes(s) ||
        a.student?.name?.toLowerCase().includes(s)
      );
    }
    const total = apps.length;
    const paginated = apps.slice((page - 1) * limit, page * limit);
    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /applications/:id
exports.getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('student')
      .populate({ path: 'drive', populate: { path: 'company' } });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, message: 'Application fetched successfully', data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /applications/:id
exports.updateApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, message: 'Application updated successfully', data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
