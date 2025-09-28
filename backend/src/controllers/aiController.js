import { v4 as uuidv4 } from 'uuid';
import CodeSubmission from '../models/codeSubmission.js';
import { generateCorrection } from '../services/aiService.js';

export async function aiHealth(req, res) {
  return res.json({ success: true, message: 'AI route healthy' });
}

export async function aiTest(req, res) {
  const sample = `PADAM name:VARTTAI = 'Hello'\nCHATIMPU(name)`;
  const result = await generateCorrection(sample, [ { line: 1, type: 'SYNTAX_ERROR', message: 'Missing semicolon or wrong quotes' } ]);
  return res.json({ success: true, message: 'AI test OK', sampleResult: result });
}



export async function aiCorrect(req, res) {
  try {
    
    let code = null;
    let errors = [];

    if (req.body && typeof req.body === 'object') {
      code = req.body.code || null;
      errors = req.body.errors || [];
    }

    
    if (!code && req.rawBody) {
      const raw = req.rawBody.trim();
      
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          code = code || parsed.code || null;
          errors = errors.length ? errors : (parsed.errors || []);
        }
      } catch (e) {
        
        if (raw.length > 0) code = raw;
      }
    }
    
    
    if (!code && req.query && req.query.code) {
      code = req.query.code;
    }
    
    
    if (!code && req.headers['x-code']) {
      const header = req.headers['x-code'];
      try {
        
        const maybe = Buffer.from(header, 'base64').toString('utf8');
        
        if (maybe && /\n|\r|\s/.test(maybe)) {
          code = maybe;
        } else {
          code = header;
        }
      } catch (e) {
        code = header;
      }
    }

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code not provided' });
    }

    
    const start = Date.now();
    const correction = await generateCorrection(code, errors || []);
    const processingTimeMs = Date.now() - start;

    if (correction && correction.correctedCode) {
      return res.json({ success: true, data: { correctedCode: correction.correctedCode, notes: correction.notes || '', processingTimeMs } });
    }

    
    const fallback = new CodeSubmission({
      id: uuidv4(),
      user_id: (req.user && req.user.id) || null,
      code_text: code,
      is_valid: false,
      errors: [],
      submitted_at: new Date(),
      instructor_id: null,
      instructor_verified_at: null,
      instructor_feedback: 'Saved as fallback because AI was unavailable'
    });

    await fallback.save();

    return res.status(503).json({ success: false, message: 'AI unavailable, saved fallback', submissionId: fallback.id });
  } catch (err) {
    console.error('AI correction error:', err);
    return res.status(500).json({ success: false, message: 'Server error '+ (err && err.message ? err.message : String(err)) });
  }
}
