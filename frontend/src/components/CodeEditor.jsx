import React from "react";

const THEMES = {
  light: {
    name: "Light",
    "--editor-bg": "#ffffff",
    "--editor-fg": "#0f172a",
    "--editor-muted": "#64748b",
    "--editor-gutter": "#e2e8f0",
    "--editor-border": "#cbd5e1",
    "--editor-accent": "#2563eb",
    "--editor-btn-fg": "#ffffff",
  },
  dark: {
    name: "Dark",
    "--editor-bg": "#0b1220",
    "--editor-fg": "#e5e7eb",
    "--editor-muted": "#93a0b0",
    "--editor-gutter": "#1f2a44",
    "--editor-border": "#2a3552",
    "--editor-accent": "#60a5fa",
    "--editor-btn-fg": "#0b1220",
  },
  ocean: {
    name: "Ocean",
    "--editor-bg": "#071a2e",
    "--editor-fg": "#cfe8ff",
    "--editor-muted": "#8bb8e8",
    "--editor-gutter": "#0f2a47",
    "--editor-border": "#13395f",
    "--editor-accent": "#22d3ee",
    "--editor-btn-fg": "#071a2e",
  },
};

const SAMPLE = `// Yantrabhashi sample (placeholder)
let counter = 0
loop 3 times:
  counter = counter + 1
print counter`;

export default function CodeEditor({ defaultTheme = "light", onValidate, onInsertSample }) {
  const [theme, setTheme] = React.useState(defaultTheme);
  const [code, setCode] = React.useState("");
  const [message, setMessage] = React.useState("");

  const textareaRef = React.useRef(null);
  const gutterRef = React.useRef(null);

  const lines = React.useMemo(() => {
    const count = code.split("\n").length || 1;
    const arr = [];
    for (let i = 1; i <= count; i++) arr.push(i);
    return arr;
  }, [code]);

  const onScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const applySample = () => {
    setCode(SAMPLE);
    onInsertSample?.();
    setMessage("Sample inserted");
    setTimeout(() => setMessage(""), 1200);
  };

  const handleValidate = () => {
    onValidate?.(code);
    setMessage("Request sent (no backend wired yet)");
    setTimeout(() => setMessage(""), 1500);
  };

  const styleVars = THEMES[theme] || THEMES.light;

  return (
    <section className="editor" style={styleVars}>
      <div className="toolbar">
        <label className="select">
          <span>Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {Object.entries(THEMES).map(([key, v]) => (
              <option key={key} value={key}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={applySample}>
          Insert Sample
        </button>
        <button className="btn btn-primary" onClick={handleValidate}>
          Validate
        </button>
      </div>

      <div className="editor-shell" style={{ display: "flex", height: "100%" }}>
        <div
          className="gutter"
          ref={gutterRef}
          aria-hidden="true"
          style={{ overflowY: "auto" }}
        >
          <pre className="line-numbers">
            {lines.map((n) => (
              <span key={n} style={{ display: "block", height: "22px", lineHeight: "22px" }}>
                {n}
              </span>
            ))}
          </pre>
        </div>

        <textarea
          ref={textareaRef}
          className="textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={onScroll}
          placeholder="// Write your Yantrabhashi code here"
          spellCheck={false}
        />
      </div>

      {message ? <div className="notice">{message}</div> : null}
    </section>
  );
}
