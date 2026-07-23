import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import socket from '../socket/socket';

const TerminalComponent = forwardRef(({ code, language, onClose }, ref) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [running, setRunning] = useState(false);

  useImperativeHandle(ref, () => ({
    run: () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
        xtermRef.current.focus();
      }
      setRunning(true);
      socket.emit('terminal-run', { code, language });
    }
  }));

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#181818',
        foreground: '#cccccc',
        cursor: '#007acc',
      },
      fontSize: 13,
      fontFamily: '"Fira Code", "Cascadia Code", monospace',
      rows: 12,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;36m<CollabCode Terminal />\x1b[0m');
    term.writeln('\x1b[90mPress Run Code to execute...\x1b[0m');

    // Har keypress seedha server ko bhejo — pty handle karega
    term.onData((data) => {
      socket.emit('terminal-input', { input: data });
    });

    // Resize event
    term.onResize(({ cols, rows }) => {
      socket.emit('terminal-resize', { cols, rows });
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    socket.on('terminal-done', () => {
      setRunning(false);
    });

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('terminal-output');
      socket.off('terminal-done');
      term.dispose();
    };
  }, []);

  return (
    <div className="h-64 bg-[#181818] border-t border-[#3c3c3c] flex flex-col font-mono antialiased">
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e1e1e] border-b border-[#3c3c3c]">
        <span className="text-[#007acc] text-xs font-bold tracking-wide uppercase">Terminal</span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="text-[#858585] hover:text-[#cccccc] text-xs transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
    </div>
  );
});

export default TerminalComponent;