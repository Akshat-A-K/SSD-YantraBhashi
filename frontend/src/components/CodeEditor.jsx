import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";

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
  height = "500px",
  instructorFeedback = null
}) {
  const [theme, setTheme] = useState(defaultTheme);
  const [code, setCode] = useState(initialCode || SAMPLE_CODE);
  const [message, setMessage] = useState("");
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
    
    // Register custom language
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

  // Add markers for validation errors
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
          setMessage("✅ Code is valid! No errors found.");
          setValidationErrors([]);
        } else {
          setMessage(`❌ Code has ${result.errors.length} error(s).`);
          setValidationErrors(result.errors || []);
        }
      } else {
        setMessage("❌ Validation failed. Please try again.");
        setValidationErrors([]);
      }
    } catch (error) {
      setMessage("❌ Validation error: " + error.message);
      setValidationErrors([]);
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
    
    setTimeout(() => setMessage(""), 5000);
  }, [code]);

  const handleAISuggestion = useCallback(() => {
    onAISuggestion?.(code);
    setMessage("AI suggestion requested");
    setTimeout(() => setMessage(""), 2000);
  }, [code, onAISuggestion]);

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
    <div className="simple-editor">
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
          >
            AI Suggestion
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

      {/* Loading State */}
      {isValidating && (
        <div className="validation-loading">
          <div className="loading-spinner"></div>
          <span>Validating code...</span>
        </div>
      )}

      {/* Instructor Feedback */}
      {instructorFeedback && (
        <div className="instructor-feedback">
          <div className="feedback-header">
            <h4>📝 Instructor Feedback</h4>
          </div>
          <div className="feedback-content">
            <p>{instructorFeedback}</p>
          </div>
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