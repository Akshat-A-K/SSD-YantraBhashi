import { SubmissionService } from '../services/submissionService.js';

const submissionService = new SubmissionService();

export async function validateCode(req, res) {
  const { code } = req.body;
  if (!code)
    return res.status(400).json({ error: "Code not provided" });

  const { isValid, errors } = submissionService.validateInputCode(code);

  // perform db writes

  res.status(201).json({});
}