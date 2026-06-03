const Interview = require('../models/Interview');
const Application = require('../models/Application');

// POST /interviews
exports.scheduleInterview = async (req, res) => {
  try {
    const { interviewId, application: appId, interviewer, round, interviewDate, status } = req.body;
    if (!interviewId || !appId || !round || !interviewDate) {
      return res.status(400).json({ success: false, message: 'interviewId, application, round and interviewDate are required' });
    }
    if (isNaN(new Date(interviewDate).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid interview date' });
    }
    const appDoc = await Application.findById(appId);
    if (!appDoc) return res.status(404).json({ success: false, message: 'Application not found' });
    if (appDoc.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Rejected application cannot receive interview' });
    }
    if (appDoc.status === 'selected') {
      return res.status(400).json({ success: false, message: 'Selected candidate cannot be rescheduled' });
    }
    const interview = await Interview.create({
      interviewId, application: appId, interviewer: interviewer || '',
      round, interviewDate: new Date(interviewDate),
      status: status || 'scheduled', result: 'pending',
    });
    res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /interviews/:id
exports.updateInterview = async (req, res) => {
  try {
    const { result, status, interviewer, round, interviewDate, feedback } = req.body;
    const allowedResults = ['pending', 'pass', 'fail'];
    if (result && !allowedResults.includes(result)) {
      return res.status(400).json({ success: false, message: 'Result must be pending, pass or fail' });
    }
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'application',
        populate: [
          { path: 'student', select: 'studentId name' },
          { path: 'drive', populate: { path: 'company', select: 'companyId name' } },
        ],
      });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const updateData = {};
    if (result) { updateData.result = result; updateData.status = 'completed'; }
    if (status) updateData.status = status;
    if (interviewer) updateData.interviewer = interviewer;
    if (round) updateData.round = round;
    if (interviewDate) updateData.interviewDate = new Date(interviewDate);
    if (feedback !== undefined) updateData.feedback = feedback;

    const updated = await Interview.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate({
        path: 'application',
        populate: [
          { path: 'student', select: 'studentId name' },
          { path: 'drive', populate: { path: 'company', select: 'companyId name' } },
        ],
      });
    res.status(200).json({ success: true, message: 'Interview updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /interviews
exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate({
        path: 'application',
        populate: [
          { path: 'student', select: 'studentId name department' },
          { path: 'drive', select: 'driveId title', populate: { path: 'company', select: 'name' } },
        ],
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Interviews fetched successfully', total: interviews.length, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
