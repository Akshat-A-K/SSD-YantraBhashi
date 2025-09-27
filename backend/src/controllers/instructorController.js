import User from '../models/user.js';
import CodeSubmission from '../models/codeSubmission.js';

export async function getAllStudents(req, res) {
  try {
    // Get all users with role 'student'
    const students = await User.find({ role: 'student' })
      .select('id username email created_at')
      .lean();

    // Get submission counts for each student
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        const submissionCount = await CodeSubmission.countDocuments({ 
          user_id: student.id 
        });
        return {
          ...student,
          submissionsCount: submissionCount
        };
      })
    );

    return res.json({ 
      success: true, 
      students: studentsWithCounts 
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function getStudentSubmissions(req, res) {
  try {
    const { studentId } = req.params;

    // Verify the student exists
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Get all submissions for this student
    const submissions = await CodeSubmission.find({ user_id: studentId })
      .sort({ submitted_at: -1 })
      .lean();

    const formattedSubmissions = submissions.map(sub => ({
      id: sub.id,
      studentId: sub.user_id,
      title: `Submission ${sub.id.slice(0, 8)}`, // Generate a title from submission ID
      code: sub.code_text,
      is_valid: sub.is_valid,
      errors: sub.errors.map(e => ({
        line_no: e.line_no,
        error_text: e.error
      })),
      submittedAt: sub.submitted_at,
      status: sub.instructor_verified_at ? 'verified' : 'submitted',
      instructor_feedback: sub.instructor_feedback || ''
    }));

    return res.json({ 
      success: true, 
      submissions: formattedSubmissions 
    });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function getAllSubmissions(req, res) {
  try {
    // Get all submissions with user information
    const submissions = await CodeSubmission.find({})
      .sort({ submitted_at: -1 })
      .lean();

    // Get user information for each submission
    const submissionsWithUsers = await Promise.all(
      submissions.map(async (submission) => {
        const user = await User.findOne({ id: submission.user_id })
          .select('username email role')
          .lean();
        
        return {
          id: submission.id,
          user_id: submission.user_id,
          username: user?.username || 'Unknown',
          email: user?.email || 'Unknown',
          code: submission.code_text,
          is_valid: submission.is_valid,
          errors: submission.errors.map(e => ({
            line_no: e.line_no,
            error_text: e.error
          })),
          submitted_at: submission.submitted_at,
          instructor_id: submission.instructor_id,
          instructor_verified_at: submission.instructor_verified_at,
          instructor_feedback: submission.instructor_feedback
        };
      })
    );

    return res.json({ 
      success: true, 
      submissions: submissionsWithUsers 
    });
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}
