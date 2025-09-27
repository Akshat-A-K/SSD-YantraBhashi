import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
  line_no: { type: Number, required: true },
  error: { type: String, required: true }
});

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  code_text: { type: String, required: true },
  is_valid: { type: Boolean, required: true },
  errors: { type: [errorSchema], default: [] },
  submitted_at: { type: Date, required: true },
  instructor_id: { type: String, default: null },
  instructor_verified_at: { type: Date, default: null },
  instructor_feedback: { type: String, default: '' }
});

export default mongoose.model('CodeSubmission', submissionSchema);
