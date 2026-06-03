const Company = require('../models/Company');

// POST /companies
exports.createCompany = async (req, res) => {
  try {
    const { companyId, name, role, package: pkg, eligibleDepartments, minimumCgpa, driveDate, status } = req.body;
    if (!companyId || !name || !role || !minimumCgpa || !driveDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const existing = await Company.findOne({ companyId });
    if (existing) return res.status(409).json({ success: false, message: 'Company already exists' });
    const company = await Company.create({
      companyId, name, role,
      package: pkg || 0,
      eligibleDepartments: (eligibleDepartments || []).map(d => d.toUpperCase()),
      minimumCgpa,
      driveDate,
      status: status || 'upcoming',
    });
    res.status(201).json({ success: true, message: 'Company created successfully', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /companies
exports.getCompanies = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const companies = await Company.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Companies fetched successfully',
      total: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /companies/:id
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.status(200).json({ success: true, message: 'Company fetched successfully', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /companies/:id
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.status(200).json({ success: true, message: 'Company updated successfully', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /companies/:id
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.status(200).json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
