import { SubmissionService } from '../services/submissionService.js';
import CodeSubmission from '../models/codeSubmission.js';
import { v4 as uuidv4 } from 'uuid';

const submissionService = new SubmissionService();

export async function validateCode(req, res) {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: "Code not provided" });
    }

    const validationErrors = submissionService.validate_code(code);

    const errors = validationErrors.map(e => ({
      line_no: e.line,
      error: e.message
    }));

    const newSubmission = new CodeSubmission({
      id: uuidv4(),
      user_id: userId,
      code_text: code,
      is_valid: errors.length === 0,
      errors: errors,
      submitted_at: new Date(),
      instructor_id: null,
      instructor_verified_at: null,
      instructor_feedback: ''
    });

    await newSubmission.save();

    return res.status(201).json({ success: true, submissionId: newSubmission.id });
  } catch (error) {
    console.error('Error validating code:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getUserSubmissions(req, res) {
  try {
    const userId = req.user.id;

    const submissions = await CodeSubmission.find({ user_id: userId })
      .sort({ submitted_at: -1 })
      .lean();

    const items = submissions.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      code: sub.code_text,
      is_valid: sub.is_valid,
      errors: sub.errors.map(e => ({
        line_no: e.line_no,
        error_text: e.error
      })),
      submitted_at: sub.submitted_at,
      instructor_id: sub.instructor_id,
      instructor_verified_at: sub.instructor_verified_at,
      instructor_feedback: sub.instructor_feedback
    }));

    return res.json({ items });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


export async function verifySubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const instructorId = req.user.id;
    const { instructor_feedback } = req.body;

    const updateData = {
      instructor_id: instructorId,
      instructor_verified_at: new Date(),
    };

    if (typeof instructor_feedback === 'string') {
      updateData.instructor_feedback = instructor_feedback;
    }

    const updated = await CodeSubmission.findOneAndUpdate(
      { id: submissionId },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error verifying submission:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
