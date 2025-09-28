import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import apiService from "../services/apiService";

const THEMES = [
  { value: "vs", label: "Light" },
  { value: "vs-dark", label: "Dark" }
];

const SAMPLE_CODE = `# Hello World program
PADAM message:VARTTAI = "Hello World";
CHATIMPU(message);

# Addition program
PADAM a:ANKHE;
PADAM b:ANKHE;
PADAM sum:ANKHE = 0;
CHEPPU(a);
CHEPPU(b);
sum = a + b;
CHATIMPU("The Sum is:");
CHATIMPU(sum);

# Conditional Statements
PADAM username:VARTTAI;
CHEPPU(username);
ELAITHE (username == "Anirudh") [
CHATIMPU("Welcome Anirudh!");
] ALAITHE [
CHATIMPU("Access Denied!");
]

# Printing Sum of First 10 numbers
PADAM i:ANKHE;
PADAM sum:ANKHE = 0;
MALLI-MALLI (PADAM i:ANKHE = 1; i <= 10; i = i + 1) [
sum = sum + i;
]
CHATIMPU("Sum of first 10 numbers is:");
CHATIMPU(sum);`;

export default function CodeEditor({ 
  defaultTheme = "vs-dark", 
  initialCode = "",
  onValidate, 
  onInsertSample,
  onChange,
  onAISuggestion,
  onApplyCorrection,
  height = "500px",
  instructorFeedback = null
}) {
  const [theme, setTheme] = useState(defaultTheme);
  const [code, setCode] = useState(initialCode || SAMPLE_CODE);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiOverlay, setShowAiOverlay] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [editorOptions] = useState({
    minimap: { enabled: false },
    lineNumbers: "on",
    wordWrap: "on",
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    cursorBlinking: "blink",
    smoothScrolling: true,
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    hover: { enabled: true },
    contextmenu: true,
    readOnly: false,
    folding: true,
    bracketPairColorization: { enabled: true }
  });
  const [decorationIds, setDecorationIds] = useState([]);

  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    
    monaco.languages.register({ id: 'custom' });
    monaco.languages.setMonarchTokensProvider('custom', {
      tokenizer: {
        root: [
          [/#.*$/, 'comment'],
          [/\b(PADAM|CHATIMPU|CHEPPU|ELAITHE|ALAITHE|MALLI-MALLI|VARTTAI|ANKHE)\b/, 'keyword'],
          [/\b\d+\.\s*/, 'number'],
          [/\b\d+\b/, 'number'],
          [/"[^"]*"/, 'string'],
          [/[a-zA-Z_$][a-zA-Z0-9_$]*/, 'identifier'],
          [/[[\](){}]/, 'delimiter'],
          [/[=+\-*/<>!&|]/, 'operator']
        ]
      }
    });
  }, []);

  
  useEffect(() => {
    if (editorRef.current) {
      try {
        const model = editorRef.current.getModel();
        if (model) {
          const newDecorations = validationErrors.map(error => ({
            range: {
              startLineNumber: error.line_no,
              startColumn: 1,
              endLineNumber: error.line_no,
              endColumn: model.getLineMaxColumn(error.line_no)
            },
            options: {
              isWholeLine: true,
              className: 'error-line-highlight',
              glyphMarginClassName: 'error-glyph'
            }
          }));
          
          const newIds = editorRef.current.deltaDecorations(decorationIds, newDecorations);
          setDecorationIds(newIds);
        }
      } catch (error) {
        console.error('Error with markers:', error);
      }
    }
  }, [validationErrors, decorationIds]);

  const handleEditorChange = useCallback((value) => {
    setCode(value || "");
    onChange?.(value || "");
  }, [onChange]);

  const applySample = useCallback(() => {
    setCode(SAMPLE_CODE);
    onInsertSample?.();
    setMessage("Sample code loaded");
    setTimeout(() => setMessage(""), 2000);
  }, [onInsertSample]);

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    setMessage("Validating code...");
    setValidationErrors([]);
    
    try {
      const response = await fetch('http://localhost:7979/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.is_valid) {
          setMessage("Code is valid. No errors found.");
          setValidationErrors([]);
        } else {
          setMessage(`Code has ${result.errors.length} error(s).`);
          setValidationErrors(result.errors || []);
        }
      } else {
        setMessage("Validation failed. Please try again.");
        setValidationErrors([]);
      }
    } catch (error) {
  setMessage("Validation error: " + error.message);
      setValidationErrors([]);
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
    
    setTimeout(() => setMessage(""), 5000);
  }, [code]);

  const handleAISuggestion = useCallback(async () => {
    setAiLoading(true);
    setShowAiOverlay(true);
    setMessage("AI suggestion requested");
    try {
      let result;
      if (typeof onAISuggestion === 'function') {
        
        result = await Promise.resolve(onAISuggestion(code));
        
        if (result === undefined) {
          result = await apiService.aiSuggest(code, { errors: validationErrors });
        }
      } else {
        
        result = await apiService.aiSuggest(code, { errors: validationErrors });
      }

      console.log('AI suggestion result:', result);
      
      if (result && (result.correctedCode || result.corrected)) {
        const normalized = { correctedCode: result.correctedCode || result.corrected, notes: result.notes || result.notes };
        setAiSuggestion(normalized);
      }
    } catch (err) {
      console.error('AI suggestion failed:', err);
      setMessage('AI suggestion failed: ' + (err && err.message));
    } finally {
      setAiLoading(false);
      setTimeout(() => setMessage(""), 3000);
      setTimeout(() => setShowAiOverlay(false), 500);
    }
  }, [code, onAISuggestion]);

  const handleApplySuggestion = useCallback((apply) => {
    if (!aiSuggestion) return;
    if (apply) {
      
      if (typeof onApplyCorrection === 'function') {
        try { onApplyCorrection(true); } catch (e) { /* ignore */ }
      } else {
        setCode(aiSuggestion.correctedCode);
        onChange?.(aiSuggestion.correctedCode);
      }
      setMessage('AI suggestion applied');
    } else {
      if (typeof onApplyCorrection === 'function') {
        try { onApplyCorrection(false); } catch (e) { /* ignore */ }
      }
      setMessage('AI suggestion dismissed');
    }
    setAiSuggestion(null);
    setTimeout(() => setMessage(""), 2000);
  }, [aiSuggestion, onApplyCorrection, onChange]);

  const handleSaveFile = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage("File saved successfully");
    setTimeout(() => setMessage(""), 2000);
  }, [code]);

  const handleImportFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.py,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.kt,.swift,.html,.css,.json,.xml,.yaml,.yml,.md';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          setCode(content);
          onChange?.(content);
          setMessage(`File "${file.name}" imported successfully`);
          setTimeout(() => setMessage(""), 2000);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onChange]);

  return (
  <div className="simple-editor" style={{ position: 'relative' }}>
      {showAiOverlay && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#fff9', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" style={{ marginBottom: 12 }}></div>
          <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18 }}>AI is analyzing your code...</div>
        </div>
      )}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-group">
            <label className="toolbar-label">Theme:</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="toolbar-select"
            >
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            className="toolbar-btn" 
            onClick={handleImportFile}
            title="Import File"
          >
            Import
          </button>
          <button 
            className="toolbar-btn" 
            onClick={handleSaveFile}
            title="Save File"
          >
            Save
          </button>
          <button 
            className="toolbar-btn" 
            onClick={applySample}
            title="Load Sample Code"
          >
            Load Sample
          </button>
          <button 
            className="toolbar-btn" 
            onClick={handleAISuggestion}
            title="Get AI Suggestion"
            disabled={aiLoading}
          >
            {aiLoading ? 'AI...' : 'AI Suggestion'}
          </button>
          <button 
            className="toolbar-btn toolbar-btn-primary" 
            onClick={handleValidate}
            title="Validate Code"
          >
            Validate
          </button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height={height}
          language="custom"
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={<div className="editor-loading">Loading editor...</div>}
        />
      </div>

      {/* Error Display Section */}
      {validationErrors.length > 0 && (
        <div className="error-panel">
          <div className="error-panel-header">
            <h4>Validation Errors ({validationErrors.length})</h4>
          </div>
          <div className="error-list">
            {validationErrors.map((error, index) => (
              <div key={index} className="error-item">
                <div className="error-line">
                  <span className="error-line-number">Line {error.line_no}</span>
                  <span className="error-message">{error.error}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestion Preview Panel */}
      {aiSuggestion && (
        <div className="ai-suggestion-panel" style={{ margin: '18px 0', padding: '16px', background: '#f1f5f9', borderRadius: '8px', boxShadow: '0 2px 8px #0001', position: 'relative', zIndex: 11 }}>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: '#2563eb' }}>AI Suggestion</h3>
          <div style={{ marginBottom: 10 }}>
            <strong>Notes:</strong> {aiSuggestion.notes || "No notes provided."}
          </div>
          <pre style={{ background: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: 10 }}>{aiSuggestion.correctedCode}</pre>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => handleApplySuggestion(true)}>Apply</button>
            <button className="btn btn-secondary" onClick={() => handleApplySuggestion(false)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="validation-loading">
          <div className="loading-spinner"></div>
          <span>Validating code...</span>
        </div>
      )}


      {message && (
        <div className="editor-message">
          {message}
        </div>
      )}
    </div>
  );
}