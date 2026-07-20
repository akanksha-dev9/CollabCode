import { useState } from 'react';
import axios from 'axios';

function AIPanel({ code, language }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAI = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      setError('');
      setResponse('');

      const res = await axios.post('http://localhost:5000/api/ai/review', {
        code,
        question,
        language
      });

      setResponse(res.data.response);
    } catch (err) {
      setError('AI se response nahi aaya, try again karo');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const quickQuestions = [
    'Explain this code',
    'Find bugs',
    'Optimize this',
    'Add comments'
  ];

  return (
    <div className="w-72 flex flex-col bg-[#181825] border-l border-[#313244]">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#313244]">
        <h2 className="text-[#cba6f7] font-semibold text-sm">AI Assistant</h2>
        <p className="text-[#6c7086] text-xs mt-0.5">Ask anything about your code</p>
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-2 border-b border-[#313244] flex flex-wrap gap-1">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuestion(q)}
            className="text-xs bg-[#313244] text-[#a6adc8] px-2 py-1 rounded hover:bg-[#45475a] hover:text-[#cdd6f4] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {!response && !loading && !error && (
          <p className="text-[#6c7086] text-xs text-center mt-8">
            Ask a question about your code
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-[#cba6f7] text-sm mt-8 justify-center">
            <div className="w-4 h-4 border-2 border-[#cba6f7] border-t-transparent rounded-full animate-spin"/>
            Thinking...
          </div>
        )}

        {error && (
          <p className="text-[#f38ba8] text-xs text-center mt-4 bg-[#f38ba8]/10 p-2 rounded">
            {error}
          </p>
        )}

        {response && (
          <div className="text-[#cdd6f4] text-sm whitespace-pre-wrap leading-relaxed bg-[#313244] p-3 rounded-lg">
            {response}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#313244] flex flex-col gap-2">
        <textarea
          placeholder="Ask about the code... (Enter to send)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] rounded-lg px-3 py-2 text-sm outline-none border border-[#45475a] focus:border-[#cba6f7] transition-colors resize-none"
        />
        <button
          onClick={askAI}
          disabled={loading || !question.trim()}
          className="bg-[#cba6f7] text-[#1e1e2e] py-2 rounded-lg text-sm font-semibold hover:bg-[#b794f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Asking...' : 'Ask AI'}
        </button>
      </div>

    </div>
  );
}

export default AIPanel;