const Drive = require('../models/Drive');
const Company = require('../models/Company');

// POST /drives
exports.createDrive = async (req, res) => {
  try {
    const { driveId, company, title, mode, location, registrationDeadline, rounds, status } = req.body;
    if (!driveId || !company || !title || !mode || !registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const companyDoc = await Company.findById(company);
    if (!companyDoc) return res.status(404).json({ success: false, message: 'Company not found' });
    const existing = await Drive.findOne({ driveId });
    if (existing) return res.status(409).json({ success: false, message: 'Drive already exists' });
    const drive = await Drive.create({ driveId, company, title, mode, location, registrationDeadline, rounds: rounds || [], status: status || 'open' });
    res.status(201).json({ success: true, message: 'Drive created successfully', data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /drives
exports.getDrives = async (req, res) => {
  try {
    const { status, company: companyName, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (companyName) {
      const companies = await Company.find({ name: { $regex: companyName, $options: 'i' } });
      filter.company = { $in: companies.map(c => c._id) };
    }
    const drives = await Drive.find(filter)
      .populate({ path: 'company', select: 'companyId name package eligibleDepartments minimumCgpa driveDate' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Drives fetched successfully', total: drives.length, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /drives/:id
exports.getDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('company');
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    res.status(200).json({ success: true, message: 'Drive fetched successfully', data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /drives/:id
exports.updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    res.status(200).json({ success: true, message: 'Drive updated successfully', data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /drives/:id
exports.deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    res.status(200).json({ success: true, message: 'Drive deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
