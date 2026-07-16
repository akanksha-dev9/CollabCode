const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const languageConfig = {
  cpp: {
    image: 'gcc:latest',
    filename: 'main.cpp',
    command: 'g++ main.cpp -o main && ./main'
  },
  python: {
    image: 'python:3.10',
    filename: 'main.py',
    command: 'python main.py'
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
  },
};

router.post('/run', async (req, res) => {
  const { code, language, input } = req.body; // input add kiya

  const config = languageConfig[language];
  if (!config) {
    return res.status(400).json({ success: false, message: 'Language not supported' });
  }

  console.log(req.body);
  console.log("Input:", input);

  const execId = uuidv4();
  const tmpDir = path.join(os.tmpdir(), execId);
  const codeFile = path.join(tmpDir, config.filename);
  const inputFile = path.join(tmpDir, 'input.txt');

  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(codeFile, code);
    fs.writeFileSync(inputFile, input || ''); // input file save karo

    const dockerPath = tmpDir.replace(/\\/g, '/').replace('C:', '/c');

    // Input file bhi mount karo aur stdin se pass karo
    const dockerCommand = `docker run --rm --memory="128m" --cpus="0.5" --network none -v "${dockerPath}:/code" -w /code ${config.image} sh -c "${config.command} < input.txt"`;

    console.log('Running:', dockerCommand);

    exec(dockerCommand, { timeout: 10000 }, (error, stdout, stderr) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });

      if (error && !stdout) {
        return res.json({
          success: true,
          output: stderr || error.message,
          error: true
        });
      }

      res.json({
        success: true,
        output: stdout || stderr || 'No output',
        error: !!stderr
      });
    });

  } catch (err) {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    console.log('Execute error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;