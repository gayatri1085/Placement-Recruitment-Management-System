const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');
const syncController = require('../controllers/syncController');
const studentController = require('../controllers/studentController');
const companyController = require('../controllers/companyController');
const driveController = require('../controllers/driveController');
const applicationController = require('../controllers/applicationController');
const interviewController = require('../controllers/interviewController');
const analyticsController = require('../controllers/analyticsController');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Root
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Placement Recruitment API Running' });
});

// Health
router.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const documentCount = await Student.countDocuments();
    res.json({ success: true, message: 'Database connected successfully', data: { database: dbStatus, documentCount } });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// Sync
router.post('/sync', protect, authorize('admin', 'placement_officer'), syncController.syncData);

// Students
router.get('/students', protect, studentController.getStudents);
router.get('/students/:id', protect, studentController.getStudent);

// Companies
router.post('/companies', protect, authorize('admin', 'placement_officer'), companyController.createCompany);
router.get('/companies', protect, companyController.getCompanies);
router.get('/companies/:id', protect, companyController.getCompany);
router.patch('/companies/:id', protect, authorize('admin', 'placement_officer'), companyController.updateCompany);
router.delete('/companies/:id', protect, authorize('admin', 'placement_officer'), companyController.deleteCompany);

// Drives
router.post('/drives', protect, authorize('admin', 'placement_officer'), driveController.createDrive);
router.get('/drives', protect, driveController.getDrives);
router.get('/drives/:id', protect, driveController.getDrive);
router.patch('/drives/:id', protect, authorize('admin', 'placement_officer'), driveController.updateDrive);
router.delete('/drives/:id', protect, authorize('admin', 'placement_officer'), driveController.deleteDrive);

// Applications
router.post('/applications', protect, applicationController.createApplication);
router.get('/applications', protect, applicationController.getApplications);
router.get('/applications/:id', protect, applicationController.getApplication);
router.patch('/applications/:id', protect, authorize('admin', 'placement_officer'), applicationController.updateApplication);
router.delete('/applications/:id', protect, authorize('admin', 'placement_officer'), applicationController.deleteApplication);

// Interviews
router.post('/interviews', protect, authorize('admin', 'placement_officer'), interviewController.scheduleInterview);
router.get('/interviews', protect, interviewController.getInterviews);
router.patch('/interviews/:id', protect, authorize('admin', 'placement_officer'), interviewController.updateInterview);

// Analytics
router.get('/analytics/placements', protect, authorize('admin', 'placement_officer'), analyticsController.getPlacementAnalytics);
router.get('/analytics/departments', protect, authorize('admin', 'placement_officer'), analyticsController.getDepartmentAnalytics);
router.get('/analytics/companies', protect, authorize('admin', 'placement_officer'), analyticsController.getCompanyAnalytics);

module.exports = router;
