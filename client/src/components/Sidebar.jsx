import { useState, useEffect, useRef } from 'react';

function Sidebar({ messages, username, users, onSendMessage }) {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="w-72 bg-[#252526] border-l border-[#3c3c3c] flex flex-col font-sans text-[#cccccc] antialiased">

      {/* Tabs */}
      <div className="flex border-b border-[#3c3c3c] bg-[#1e1e1e] font-mono text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'chat'
              ? 'text-[#007acc] border-b-2 border-[#007acc] bg-[#252526]'
              : 'text-[#858585] hover:text-[#cccccc]'
          }`}
        >
          // CHAT
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'text-[#007acc] border-b-2 border-[#007acc] bg-[#252526]'
              : 'text-[#858585] hover:text-[#cccccc]'
          }`}
        >
          // USERS ({users.length})
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {messages.length === 0 && (
              <p className="text-[#858585] text-xs text-center mt-6 font-mono">
                // No messages yet
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.user === username ? 'items-end' : 'items-start'}`}>
                {msg.user === 'System' ? (
                  <p className="text-[#858585] text-xs text-center w-full py-1 font-mono">
                    -- {msg.message} --
                  </p>
                ) : (
                  <>
                    <span className="text-[#858585] text-[10px] mb-0.5 font-mono">{msg.user}</span>
                    <div className={`px-3 py-2 rounded text-xs max-w-[90%] leading-relaxed ${
                      msg.user === username
                        ? 'bg-[#0e639c] text-white'
                        : 'bg-[#1e1e1e] text-[#cccccc] border border-[#3c3c3c]'
                    }`}>
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#3c3c3c] bg-[#1e1e1e] flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-[#252526] text-[#cccccc] placeholder-[#555555] rounded px-3 py-1.5 text-xs outline-none border border-[#3c3c3c] focus:border-[#007acc] transition-colors"
            />
            <button
              onClick={handleSend}
              className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {users.map((user, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-[#1e1e1e] border border-[#3c3c3c] px-3 py-2 rounded">
              <div className="w-7 h-7 rounded-full bg-[#007acc] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-[#cccccc] text-xs font-mono">{user.username}</span>
              {user.username === username && (
                <span className="text-[#858585] text-[10px] font-mono ml-auto">(you)</span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Sidebar;