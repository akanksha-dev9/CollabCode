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
        background: '#0d0d0d',
        foreground: '#cdd6f4',
        cursor: '#cba6f7',
      },
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", monospace',
      rows: 12,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;35mCollabCode Terminal\x1b[0m');
    term.writeln('\x1b[90mPress Run to execute code\x1b[0m');

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
    <div className="h-64 bg-[#0d0d0d] border-t border-[#313244] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-1 bg-[#181825] border-b border-[#313244]">
        <span className="text-[#cba6f7] text-xs font-semibold uppercase tracking-wider">Terminal</span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="text-[#6c7086] hover:text-[#cdd6f4] text-xs transition-colors"
        >
          ✕
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden" />
    </div>
  );
});

export default TerminalComponent;