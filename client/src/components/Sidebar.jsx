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
    <div className="w-72 bg-[#181825] border-l border-[#313244] flex flex-col">

      {/* Tabs */}
      <div className="flex border-b border-[#313244]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-[#cba6f7] border-b-2 border-[#cba6f7]'
              : 'text-[#6c7086] hover:text-[#cdd6f4]'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-[#cba6f7] border-b-2 border-[#cba6f7]'
              : 'text-[#6c7086] hover:text-[#cdd6f4]'
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-[#6c7086] text-xs text-center mt-4">
                No messages yet
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.user === username ? 'items-end' : 'items-start'}`}>
                {msg.user === 'System' ? (
                  <p className="text-[#6c7086] text-xs text-center w-full py-1">
                    {msg.message}
                  </p>
                ) : (
                  <>
                    <span className="text-[#6c7086] text-xs mb-1">{msg.user}</span>
                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${
                      msg.user === username
                        ? 'bg-[#cba6f7] text-[#1e1e2e]'
                        : 'bg-[#313244] text-[#cdd6f4]'
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
          <div className="p-3 border-t border-[#313244] flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] rounded-lg px-3 py-2 text-sm outline-none border border-[#45475a] focus:border-[#cba6f7] transition-colors"
            />
            <button
              onClick={handleSend}
              className="bg-[#cba6f7] text-[#1e1e2e] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#b794f4] transition-colors"
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
            <div key={i} className="flex items-center gap-3 bg-[#313244] px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#cba6f7] flex items-center justify-center text-[#1e1e2e] font-bold text-sm">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-[#cdd6f4] text-sm">{user.username}</span>
              {user.username === username && (
                <span className="text-[#6c7086] text-xs ml-auto">(you)</span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Sidebar;