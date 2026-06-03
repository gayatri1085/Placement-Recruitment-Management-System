const axios = require('axios');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const User = require('../models/User');

// Sanitisation helpers
const toTitleCase = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const toUpperCase = (str) => (str ? str.toUpperCase().trim() : '');
const toLowerCase = (str) => (str ? str.toLowerCase().trim() : '');
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidCgpa = (cgpa) => cgpa !== null && cgpa !== undefined && !isNaN(cgpa) && cgpa >= 0 && cgpa <= 10;
const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

// Fetch token from dataset API
const getDatasetToken = async () => {
  const res = await axios.post(`${process.env.DATASET_API_URL}/auth/login`, {
    studentId: process.env.DATASET_STUDENT_ID,
    password: process.env.DATASET_PASSWORD,
  });
  return res.data.token || res.data.data?.token;
};

// POST /sync
exports.syncData = async (req, res) => {
  try {
    const token = await getDatasetToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [studentsRes, companiesRes, drivesRes, applicationsRes, interviewsRes] = await Promise.all([
      axios.get(`${process.env.DATASET_API_URL}/students`, { headers }),
      axios.get(`${process.env.DATASET_API_URL}/companies`, { headers }),
      axios.get(`${process.env.DATASET_API_URL}/drives`, { headers }),
      axios.get(`${process.env.DATASET_API_URL}/applications`, { headers }),
      axios.get(`${process.env.DATASET_API_URL}/interviews`, { headers }).catch(() => ({ data: { data: [] } })),
    ]);

    const rawStudents = studentsRes.data.data || studentsRes.data || [];
    const rawCompanies = companiesRes.data.data || companiesRes.data || [];
    const rawDrives = drivesRes.data.data || drivesRes.data || [];
    const rawApplications = applicationsRes.data.data || applicationsRes.data || [];
    const rawInterviews = interviewsRes.data.data || interviewsRes.data || [];

    let studentsInserted = 0, companiesInserted = 0, drivesInserted = 0, applicationsInserted = 0;
    let studentsDuplicates = 0, companiesDuplicates = 0, drivesDuplicates = 0, applicationsDuplicates = 0;
    let studentsRejected = 0, companiesRejected = 0, drivesRejected = 0, applicationsRejected = 0;

    // Students
    for (const s of rawStudents) {
      const email = toLowerCase(s.email);
      const dept = toUpperCase(s.department);
      const name = toTitleCase(s.name);
      if (!s.studentId || !isValidEmail(email) || !isValidCgpa(s.cgpa) || !s.department || !s.graduationYear) {
        studentsRejected++; continue;
      }
      const existing = await Student.findOne({ $or: [{ studentId: s.studentId }, { email }] });
      if (existing) { studentsDuplicates++; continue; }
      await Student.create({
        studentId: s.studentId,
        name,
        email,
        department: dept,
        cgpa: parseFloat(s.cgpa),
        skills: s.skills || [],
        graduationYear: s.graduationYear,
        phone: s.phone || '',
        status: s.status || 'active',
      });
      // Create student user account
      const userExists = await User.findOne({ email });
      if (!userExists) {
        await User.create({ name, email, password: s.studentId, role: 'student' });
      }
      studentsInserted++;
    }

    // Companies
    for (const c of rawCompanies) {
      if (!c.companyId || !c.name || !c.role || !isValidCgpa(c.minimumCgpa) || !isValidDate(c.driveDate)) {
        companiesRejected++; continue;
      }
      const existing = await Company.findOne({ companyId: c.companyId });
      if (existing) { companiesDuplicates++; continue; }
      await Company.create({
        companyId: c.companyId,
        name: c.name.trim(),
        role: c.role.trim(),
        package: c.package || 0,
        eligibleDepartments: (c.eligibleDepartments || []).map(toUpperCase),
        minimumCgpa: parseFloat(c.minimumCgpa),
        driveDate: new Date(c.driveDate),
        status: c.status || 'upcoming',
      });
      companiesInserted++;
    }

    // Drives
    for (const d of rawDrives) {
      if (!d.driveId || !d.company || !d.title || !isValidDate(d.registrationDeadline)) {
        drivesRejected++; continue;
      }
      const companyDoc = await Company.findOne({ companyId: d.company }) || await Company.findById(d.company);
      if (!companyDoc) { drivesRejected++; continue; }
      const existing = await Drive.findOne({ driveId: d.driveId });
      if (existing) { drivesDuplicates++; continue; }
      await Drive.create({
        driveId: d.driveId,
        company: companyDoc._id,
        title: d.title.trim(),
        mode: d.mode || 'offline',
        location: d.location || '',
        registrationDeadline: new Date(d.registrationDeadline),
        rounds: d.rounds || [],
        status: d.status || 'open',
      });
      drivesInserted++;
    }

    // Applications
    for (const a of rawApplications) {
      if (!a.applicationId || !a.student || !a.drive) {
        applicationsRejected++; continue;
      }
      const studentDoc = await Student.findOne({ studentId: a.student }) || await Student.findById(a.student);
      const driveDoc = await Drive.findOne({ driveId: a.drive }) || await Drive.findById(a.drive);
      if (!studentDoc || !driveDoc) { applicationsRejected++; continue; }
      const existing = await Application.findOne({ applicationId: a.applicationId });
      if (existing) { applicationsDuplicates++; continue; }
      await Application.create({
        applicationId: a.applicationId,
        student: studentDoc._id,
        drive: driveDoc._id,
        currentRound: a.currentRound || 'Applied',
        status: a.status || 'applied',
        appliedAt: isValidDate(a.appliedAt) ? new Date(a.appliedAt) : new Date(),
      });
      applicationsInserted++;
    }

    // Interviews
    let interviewsInserted = 0, interviewsDuplicates = 0;
    for (const i of rawInterviews) {
      if (!i.interviewId || !i.application || !i.round || !isValidDate(i.interviewDate)) continue;
      const appDoc = await Application.findOne({ applicationId: i.application }) || await Application.findById(i.application);
      if (!appDoc) continue;
      const existing = await Interview.findOne({ interviewId: i.interviewId });
      if (existing) { interviewsDuplicates++; continue; }
      await Interview.create({
        interviewId: i.interviewId,
        application: appDoc._id,
        interviewer: i.interviewer || '',
        round: i.round,
        interviewDate: new Date(i.interviewDate),
        status: i.status || 'scheduled',
        result: i.result || 'pending',
        feedback: i.feedback || '',
      });
      interviewsInserted++;
    }

    const totalFetched = rawStudents.length + rawCompanies.length + rawDrives.length + rawApplications.length;
    const inserted = studentsInserted + companiesInserted + drivesInserted + applicationsInserted;
    const duplicates = studentsDuplicates + companiesDuplicates + drivesDuplicates + applicationsDuplicates;
    const rejected = studentsRejected + companiesRejected + drivesRejected + applicationsRejected;

    res.status(200).json({
      success: true,
      message: 'Database synced successfully',
      totalFetched,
      inserted,
      duplicates,
      rejected,
      data: {
        students: studentsInserted,
        companies: companiesInserted,
        drives: drivesInserted,
        applications: applicationsInserted,
        interviews: interviewsInserted,
      },
    });
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
