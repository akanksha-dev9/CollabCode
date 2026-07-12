import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

function getLanguageExtension(language) {
  switch (language) {
    case 'javascript': return javascript();
    case 'cpp': return cpp();
    case 'python': return python();
    default: return javascript();
  }
}

function Editor({ code, language, onChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Editor destroy karo agar pehle se tha
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, indentWithTab]),
        getLanguageExtension(language),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isRemoteChange.current) {
            const newCode = update.state.doc.toString();
            onChange(newCode);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
          },
          '.cm-content': {
            padding: '16px 0',
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]); // language change hone pe editor rebuild hoga

  // Remote code change aane pe editor update karo
  useEffect(() => {
    if (!viewRef.current) return;

    const currentCode = viewRef.current.state.doc.toString();

    // Agar code same hai toh update mat karo — infinite loop bachao
    if (currentCode === code) return;

    isRemoteChange.current = true;

    viewRef.current.dispatch({
      changes: {
        from: 0,
        to: currentCode.length,
        insert: code
      }
    });

    isRemoteChange.current = false;
  }, [code]);

  return (
    <div className="flex-1 overflow-hidden bg-[#1e1e2e]">
      <div ref={editorRef} className="h-full" />
    </div>
  );
}

export default Editor;