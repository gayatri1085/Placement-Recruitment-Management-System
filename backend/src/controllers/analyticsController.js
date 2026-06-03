const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');

// GET /analytics/placements
exports.getPlacementAnalytics = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const shortlistedCount = await Application.countDocuments({ status: 'shortlisted' });
    const selectedCount = await Application.countDocuments({ status: 'selected' });
    const rejectedCount = await Application.countDocuments({ status: 'rejected' });
    res.status(200).json({
      success: true,
      message: 'Placement analytics fetched',
      data: { totalApplications, shortlistedCount, selectedCount, rejectedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /analytics/departments
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const students = await Student.find();
    const departments = [...new Set(students.map(s => s.department))];
    const result = [];
    for (const dept of departments) {
      const deptStudents = students.filter(s => s.department === dept);
      const studentIds = deptStudents.map(s => s._id);
      const placedCount = await Application.countDocuments({ student: { $in: studentIds }, status: 'selected' });
      const placementPercentage = deptStudents.length > 0
        ? ((placedCount / deptStudents.length) * 100).toFixed(2)
        : '0.00';
      result.push({ department: dept, placedCount, placementPercentage });
    }
    res.status(200).json({ success: true, message: 'Department analytics fetched', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /analytics/companies
exports.getCompanyAnalytics = async (req, res) => {
  try {
    const companies = await Company.find();
    const result = [];
    for (const company of companies) {
      const drives = await Drive.find({ company: company._id });
      const driveIds = drives.map(d => d._id);
      const participationCount = await Application.countDocuments({ drive: { $in: driveIds } });
      const selectedStudents = await Application.countDocuments({ drive: { $in: driveIds }, status: 'selected' });
      result.push({
        _id: company._id,
        companyName: company.name,
        highestPackage: company.package,
        participationCount,
        selectedStudents,
      });
    }
    res.status(200).json({ success: true, message: 'Company analytics fetched', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
