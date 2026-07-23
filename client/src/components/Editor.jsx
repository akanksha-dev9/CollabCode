import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

function getMonacoLanguage(language) {
  switch (language) {
    case 'javascript':
      return 'javascript';
    case 'cpp':
      return 'cpp';
    case 'python':
      return 'python';
    default:
      return 'javascript';
  }
}

const editorOptions = {
  fontSize: 14,
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 16 },

  // Autocomplete / IntelliSense
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: 'currentDocument',
  parameterHints: { enabled: true },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    showClasses: true,
    showFunctions: true,
    showVariables: true,
    showMethods: true,
    preview: true,
    insertMode: 'insert',
  },
};

function Editor({ code, language, onChange }) {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = (value) => {
    if (isRemoteChange.current) return;
    onChange(value ?? '');
  };

  // Remote code change — same behavior as CodeMirror
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentCode = editor.getValue();
    if (currentCode === code) return;

    isRemoteChange.current = true;
    editor.setValue(code);
    isRemoteChange.current = false;
  }, [code]);

  return (
    <div className="flex-1 overflow-hidden bg-[#1e1e2e]">
      <MonacoEditor
        height="100%"
        language={getMonacoLanguage(language)}
        theme="vs-dark"
        defaultValue={code}
        onChange={handleChange}
        onMount={handleMount}
        options={editorOptions}
      />
    </div>
  );
}

export default Editor;