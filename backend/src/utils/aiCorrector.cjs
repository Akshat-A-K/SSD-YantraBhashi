const tryRequire = (name) => { try { return require(name); } catch (e) { return null; } };
const OpenAI = tryRequire('openai');
const GoogleGenAI = tryRequire('@google/generative-ai');
const fetch = tryRequire('node-fetch') || global.fetch || null;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const geminiClient = (GoogleGenAI && GEMINI_API_KEY) ? new GoogleGenAI.GoogleGenerativeAI(GEMINI_API_KEY) : null;
let openaiClient = null;

function safeJsonExtract(text) {
  const m = text && text.match && text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

async function callOpenAI(prompt) {
  if (!OpenAI) throw new Error('openai SDK not installed');
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  const resp = await openaiClient.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are an expert in Yantrabhashi programming language and must return ONLY JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  return resp?.choices?.[0]?.message?.content || resp?.choices?.[0]?.text || '';
}

async function callGemini(prompt) {
  if (!geminiClient) throw new Error('Gemini client not configured');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
  const m = geminiClient.getGenerativeModel({ model });
  const result = await m.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function createCorrectionPrompt(code, errors) {
  const errorList = (errors || []).map(e => `Line ${e.line}: ${e.message}`).join('\n');
  return [
    'You are an expert in Yantrabhashi programming language. Return ONLY JSON with keys: correctedCode, corrections, explanation.',
    'RULES: variables PADAM..., statements end with ;, use double quotes, blocks in [ ]',
    'BUGGY CODE START',
    code,
    'BUGGY CODE END',
    'DETECTED ERRORS:',
    errorList || 'none'
  ].join('\n');
}

function validateAndFixCode(candidateCode, originalCode) {
  const lines = (candidateCode || originalCode).split(/\r?\n/);
  const corrections = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!line || !line.trim()) continue;

      const dq = (line.match(/"/g) || []).length;
      if (dq % 2 !== 0) { line = line + '"'; corrections.push(`Added missing closing quote at line ${i+1}`); }

      if (!/;\s*$/.test(line) && !/\[\s*$/.test(line) && !/\]$/.test(line) && !/\)$/.test(line)) {
        const header = /^(ELAITHE|ALAITHE|MALLI-MALLI)\b/.test(line.trim());
        if (!header) { line = line + ';'; corrections.push(`Added missing semicolon at line ${i+1}`); }
      }

    lines[i] = line;
  }
  return { correctedCode: lines.join('\n'), corrections };
}

function createFallbackResponse(code, errors, opts = {}) {
  let corrected = code.replace(/'/g, '"');
  const applied = [];
  (errors || []).forEach(err => {
    if (err && err.line) {
      const idx = err.line - 1;
      const arr = corrected.split(/\r?\n/);
      if (arr[idx] && !/;\s*$/.test(arr[idx])) { arr[idx] = arr[idx].trimEnd() + ';'; applied.push(`Added semicolon at line ${err.line}`); }
      corrected = arr.join('\n');
    }
  });
  const validated = validateAndFixCode(corrected, code);
  return { success: true, correctedCode: validated.correctedCode, corrections: applied.concat(validated.corrections), explanation: 'Rule-based fallback applied', aiProvider: 'fallback' };
}

async function correctCodeWithAI(buggyCode, errors) {
  const prompt = createCorrectionPrompt(buggyCode, errors || []);
  const providers = [];
  if (OPENAI_API_KEY && OpenAI) providers.push({ name: 'OpenAI', fn: () => callOpenAI(prompt) });
  if (geminiClient) providers.push({ name: 'Gemini', fn: () => callGemini(prompt) });
  if (providers.length === 0) return createFallbackResponse(buggyCode, errors, { attemptedProviders: [] });

  const diagnostics = [];
  for (const p of providers) {
    try {
      const text = await p.fn();
      if (!text) { diagnostics.push({ provider: p.name, ok: false, error: 'empty' }); continue; }
      const parsed = safeJsonExtract(text);
      if (parsed && parsed.correctedCode) {
        const validated = validateAndFixCode(parsed.correctedCode, buggyCode);
        return { success: true, correctedCode: validated.correctedCode, corrections: parsed.corrections || [], explanation: parsed.explanation || '', aiProvider: p.name };
      } else {
        diagnostics.push({ provider: p.name, ok: false, error: 'no json' });
      }
    } catch (e) {
      diagnostics.push({ provider: p.name, ok: false, error: e && e.message });
    }
  }
  return createFallbackResponse(buggyCode, errors, { attemptedProviders: diagnostics });
}

async function testAICorrection() {
  const sample = `PADAM name:VARTTAI = 'Hello'\nCHATIMPU(name)`;
  return await correctCodeWithAI(sample, [{ line: 1, type: 'SYNTAX_ERROR', message: 'missing semicolon' }]);
}

module.exports = { correctCodeWithAI, testAICorrection, createFallbackResponse };
