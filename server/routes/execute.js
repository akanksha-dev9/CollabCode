const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/run', async (req, res) => {
  try {
    const { code, language } = req.body;

    const languageMap = {
      'javascript': 'javascript',
      'python': 'python',
      'cpp': 'cpp'
    };

    const lang = languageMap[language] || 'javascript';

    const response = await axios.post('https://glot.io/api/run/' + lang + '/latest', {
      files: [{ name: 'main.' + (lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : 'cpp'), content: code }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token anonymous'
      }
    });

    const output = response.data;

    res.json({
      success: true,
      output: output.stdout || output.stderr || 'No output',
      error: output.stderr || null
    });

  } catch (err) {
    console.log('Execute error:', err.message);
    console.log('Execute error details:', err.response?.data);
    res.status(500).json({ success: false, message: 'Code execution failed' });
  }
});

module.exports = router;