import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import socket from '../socket/socket';

function TerminalComponent({ code, language, onClose }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // xterm initialize karo
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0d0d0d',
        foreground: '#cdd6f4',
        cursor: '#cba6f7',
        green: '#a6e3a1',
        red: '#f38ba8',
        yellow: '#f9e2af',
        blue: '#89b4fa',
      },
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", monospace',
      rows: 12,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;35mCollabCode Terminal\x1b[0m');
    term.writeln('\x1b[90mClick Run to execute your code\x1b[0m');
    term.writeln('');

    // User input handle karo
    let inputBuffer = '';
    term.onKey(({ key, domEvent }) => {
        console.log("running =", running);
    console.log("pressed =", key);
      if (!running) return;

      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        // Enter
        term.write('\r\n');
        socket.emit('terminal-input', { input: inputBuffer + '\n' });
        inputBuffer = '';
      } else if (domEvent.keyCode === 8) {
        // Backspace
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          term.write('\b \b');
        }
      } else if (printable) {
        inputBuffer += key;
        term.write(key);
      }
    });

    // Server se output receive karo
    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    socket.on('terminal-done', () => {
      setRunning(false);
      term.writeln('\x1b[90m$ ready\x1b[0m');
    });

    // Resize handle
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('terminal-output');
      socket.off('terminal-done');
      term.dispose();
    };
  }, []);

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    xtermRef.current?.clear();
    socket.emit('terminal-run', { code, language });
  };

  const handleKill = () => {
    socket.emit('terminal-kill');
    setRunning(false);
  };

  return (
    <div className="h-64 bg-[#0d0d0d] border-t border-[#313244] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-1 bg-[#181825] border-b border-[#313244]">
        <span className="text-[#cba6f7] text-xs font-semibold uppercase tracking-wider">Terminal</span>
        <div className="flex-1" />
        {!running ? (
          <button
            onClick={handleRun}
            className="text-xs bg-[#a6e3a1] text-[#1e1e2e] px-3 py-0.5 rounded font-semibold hover:bg-[#94d49a] transition-colors"
          >
            ▶ Run
          </button>
        ) : (
          <button
            onClick={handleKill}
            className="text-xs bg-[#f38ba8] text-[#1e1e2e] px-3 py-0.5 rounded font-semibold hover:bg-[#e07090] transition-colors"
          >
            ■ Stop
          </button>
        )}
        <button
          onClick={onClose}
          className="text-[#6c7086] hover:text-[#cdd6f4] text-xs transition-colors ml-2"
        >
          ✕
        </button>
      </div>

      {/* xterm terminal */}
      <div ref={terminalRef} className="flex-1 p-2 overflow-hidden" />

    </div>
  );
}

export default TerminalComponent;