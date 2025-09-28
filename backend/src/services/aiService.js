/**
 * aiService bridges the ESM backend to the recovered CommonJS aiCorrector implementation.
 * It will try to call the full AI pipeline (OpenAI/Gemini) when available, and fall back
 * to a lightweight rule-based correction if not.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

let aiCorrector = null;

async function loadAiCorrector() {
  if (aiCorrector) return aiCorrector;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const utilsDir = path.join(__dirname, '..', 'utils');
  const candidates = ['aiCorrector.cjs', 'aiCorrector.js', 'aiCorrector.mjs'];

  
  const req = createRequire(import.meta.url);

  for (const fname of candidates) {
    const fullPath = path.join(utilsDir, fname);
    if (!fs.existsSync(fullPath)) continue;

    try {
      
      const mod = req(fullPath);
      aiCorrector = mod && mod.default ? mod.default : mod;
      console.log('\u2705 Loaded AI corrector via require:', fname);
      return aiCorrector;
    } catch (requireErr) {
      
      try {
        const mod = await import(pathToFileURL(fullPath).href);
        aiCorrector = mod && mod.default ? mod.default : mod;
        console.log('\u2705 Loaded AI corrector via dynamic import:', fname);
        return aiCorrector;
      } catch (importErr) {
        console.warn('Attempt to load', fname, 'failed (require error, then import error):', requireErr && requireErr.message, importErr && importErr.message);
        
      }
    }
  }

  console.warn('\u26a0\ufe0f aiCorrector not available in utils (tried .cjs/.js/.mjs), using placeholder fallback');
  return null;
}

export async function generateCorrection(code, errors = []) {
  try {
    if (typeof code !== 'string') return null;

    const ac = await loadAiCorrector();
    if (ac && typeof ac.correctCodeWithAI === 'function') {
      
      const result = await ac.correctCodeWithAI(code, errors);
      if (result && result.success) {
        return { correctedCode: result.correctedCode, notes: result.corrections && result.corrections.join('; ') };
      }
      
      console.warn('aiCorrector returned no successful result, falling back to placeholder');
    }

    
    const lines = code.split(/\r?\n/).map(l => l.replace(/\s+$/,''));
    const compressed = [];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && lines[i] === '' && lines[i-1] === '') continue;
      compressed.push(lines[i]);
    }
    const corrected = compressed.join('\n').trimEnd() + '\n';
    return { correctedCode: corrected, notes: 'Placeholder correction applied' };
  } catch (err) {
    console.error('aiService.generateCorrection error:', err);
    return null;
  }
}
