const { spawn } = require('child_process');
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

    // Temp folder banao
    const execId = uuidv4();
    const tmpDir = path.join(os.tmpdir(), execId);
    const codeFile = path.join(tmpDir, config.filename);

    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(codeFile, code);

    // Windows path fix
    const dockerPath = tmpDir.replace(/\\/g, '/').replace('C:', '/c');

    socket.emit('terminal-output', `\r\n$ Running ${language} code...\r\n\r\n`);

    // Spawn interactive docker process
    const docker = spawn('docker', [
      'run',
      '--rm',
      '-i',
      '--memory=128m',
      '--cpus=0.5',
      '--network=none',
      '-v', `${dockerPath}:/code`,
      '-w', '/code',
      config.image,
      'sh', '-c', config.command
    ]);

    // Store process on socket for cleanup
    socket.dockerProcess = docker;

    // Send output to terminal
    docker.stdout.on('data', (data) => {
      socket.emit('terminal-output', data.toString());
    });

    docker.stderr.on('data', (data) => {
      socket.emit('terminal-output', data.toString());
    });

    docker.on('close', (code) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      socket.emit('terminal-output', `\r\n$ Process exited with code ${code}\r\n`);
      socket.emit('terminal-done');
      socket.dockerProcess = null;
    });

    docker.on('error', (err) => {
      socket.emit('terminal-output', `\r\nError: ${err.message}\r\n`);
    });

    // Timeout — 30 seconds
    setTimeout(() => {
      if (socket.dockerProcess) {
        socket.dockerProcess.kill();
        socket.emit('terminal-output', '\r\nTimeout: Process killed after 30 seconds\r\n');
      }
    }, 30000);
  });

  // User ne input diya
  socket.on('terminal-input', ({ input }) => {
    if (socket.dockerProcess) {
      socket.dockerProcess.stdin.write(input + "\n");
    }
  });

  // Terminal band karo
  socket.on('terminal-kill', () => {
    if (socket.dockerProcess) {
      socket.dockerProcess.kill();
      socket.dockerProcess = null;
      socket.emit('terminal-output', '\r\nProcess killed\r\n');
    }
  });
};