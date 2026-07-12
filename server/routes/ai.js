const express = require('express');
const router = express.Router();

router.post('/review', async (req, res) => {
  const { question, language } = req.body;
  
  // Mock responses based on question type
  const responses = {
    'Explain this code': `This ${language} code defines the main structure of your program. It includes standard input/output operations and follows proper syntax conventions.`,
    'Find bugs': `I found a potential issue — check your include statements and variable declarations. Make sure all brackets are properly closed.`,
    'Optimize this': `To optimize this ${language} code, consider using more efficient data structures and reducing redundant operations.`,
    'Add comments': `Here's your code with comments added:\n\n// Main function entry point\n// Initialize variables\n// Process logic\n// Return result`
  };

  const response = responses[question] || 
    `AI Assistant analyzing your ${language} code for: "${question}". This feature will be fully powered by AI API soon.`;

  res.json({ success: true, response });
});

module.exports = router;