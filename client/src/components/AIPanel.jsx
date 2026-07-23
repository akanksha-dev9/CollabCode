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
    <div className="w-72 flex flex-col bg-[#252526] border-l border-[#3c3c3c] font-sans text-[#cccccc] antialiased">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3c3c3c] bg-[#1e1e1e]">
        <h2 className="text-[#007acc] font-bold text-sm font-mono">// AI ASSISTANT</h2>
        <p className="text-[#858585] text-xs mt-0.5">Ask anything about your code</p>
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-2 border-b border-[#3c3c3c] bg-[#1e1e1e] flex flex-wrap gap-1">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuestion(q)}
            className="text-xs bg-[#252526] text-[#858585] border border-[#3c3c3c] px-2 py-1 rounded hover:border-[#007acc] hover:text-[#cccccc] transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-y-auto p-3 font-sans">
        {!response && !loading && !error && (
          <p className="text-[#858585] text-xs text-center mt-8 font-mono">
            // Ask a question about your code
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-[#007acc] text-xs font-mono mt-8 justify-center">
            <div className="w-4 h-4 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin"/>
            Thinking...
          </div>
        )}

        {error && (
          <p className="text-[#f14c4c] text-xs text-center mt-4 bg-[#f14c4c]/10 border border-[#f14c4c]/30 p-2 rounded">
            {error}
          </p>
        )}

        {response && (
          <div className="text-[#cccccc] text-xs whitespace-pre-wrap leading-relaxed bg-[#1e1e1e] border border-[#3c3c3c] p-3 rounded">
            {response}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#3c3c3c] bg-[#1e1e1e] flex flex-col gap-2">
        <textarea
          placeholder="Ask about code... (Enter to send)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="bg-[#252526] text-[#cccccc] placeholder-[#555555] rounded px-3 py-2 text-xs outline-none border border-[#3c3c3c] focus:border-[#007acc] transition-colors resize-none"
        />
        <button
          onClick={askAI}
          disabled={loading || !question.trim()}
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white py-2 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Asking...' : 'Ask AI'}
        </button>
      </div>

    </div>
  );
}

export default AIPanel;