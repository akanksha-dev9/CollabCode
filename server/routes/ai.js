require('dotenv').config();
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/review', async (req, res) => {
  try {
    const { code, question, language } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: 'system',
          content: `You are an expert code review assistant. The user is working with ${language} code. Give concise, helpful answers. If suggesting fixes, show the improved code.`
        },
        {
          role: 'user',
          content: `Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'No response';

    res.json({ success: true, response });

  } catch (err) {
    console.log('AI Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;