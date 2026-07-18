const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const languageConfig = {
  cpp: {
    image: 'gcc:latest',
    filename: 'main.cpp',
    command: 'g++ main.cpp -o main 2>&1 && ./main'
  },
  python: {
    image: 'python:3.10',
    filename: 'main.py',
    command: 'python -u main.py'
  },
  javascript: {
    image: 'node:18',
    filename: 'main.js',
    command: 'node main.js'
  },
  java: {
    image: 'eclipse-temurin:17',
    filename: 'Main.java',
    command: 'javac Main.java && java Main'
  }
};

module.exports = (io, socket) => {

  socket.on('terminal-run', ({ code, language, roomId }) => {
    const config = languageConfig[language];
    if (!config) {
      socket.emit('terminal-output', '\r\nLanguage not supported\r\n');
      return;
    }

    const execId = uuidv4();
    const tmpDir = path.join(os.tmpdir(), execId);
    const codeFile = path.join(tmpDir, config.filename);

    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(codeFile, code);

    const dockerPath = tmpDir.replace(/\\/g, '/').replace('C:', '/c');

    socket.emit('terminal-output', `\r\n\x1b[1;35m$ Running ${language} code...\x1b[0m\r\n\r\n`);

    // node-pty se terminal spawn karo
    const ptyProcess = pty.spawn('docker', [
      'run',
      '--rm',
      '-it',
      '--memory=128m',
      '--cpus=0.5',
      '--network=none',
      '-v', `${dockerPath}:/code`,
      '-w', '/code',
      config.image,
      'sh', '-c', config.command
    ], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME,
      env: process.env
    });

    socket.ptyProcess = ptyProcess;

    // Output frontend ko bhejo
    ptyProcess.onData((data) => {
      socket.emit('terminal-output', data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      socket.emit('terminal-output', `\r\n\x1b[90m$ Process exited with code ${exitCode}\x1b[0m\r\n`);
      socket.emit('terminal-done');
      socket.ptyProcess = null;
    });

    // Timeout 30 seconds
    setTimeout(() => {
      if (socket.ptyProcess) {
        socket.ptyProcess.kill();
        socket.emit('terminal-output', '\r\n\x1b[91mTimeout: Process killed\x1b[0m\r\n');
      }
    }, 30000);
  });

  // User input — seedha pty mein likho
  socket.on('terminal-input', ({ input }) => {
    if (socket.ptyProcess) {
      socket.ptyProcess.write(input);
    }
  });

  // Terminal resize
  socket.on('terminal-resize', ({ cols, rows }) => {
    if (socket.ptyProcess) {
      socket.ptyProcess.resize(cols, rows);
    }
  });

  socket.on('terminal-kill', () => {
    if (socket.ptyProcess) {
      socket.ptyProcess.kill();
      socket.ptyProcess = null;
    }
  });
};