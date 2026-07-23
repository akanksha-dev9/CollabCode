import { useState } from 'react';

function Navbar({
    roomId, username, language, setLanguage,
    users, onCopyRoomId, onToggleSidebar, showSidebar, onRunCode
}) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyClick = () => {
        onCopyRoomId();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
    };

    return (
        <div className="bg-[#1e1e1e] border-b border-[#3c3c3c] px-5 py-3 flex items-center justify-between font-mono antialiased">

            {/* Left — Logo, Language Picker & Run Code Button */}
            <div className="flex items-center gap-4">
                <h1 className="text-[#007acc] font-bold text-lg tracking-tight font-mono">
                    &lt;CollabCode /&gt;
                </h1>

                {/* Language selector */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#252526] text-[#cccccc] text-sm font-sans border border-[#3c3c3c] rounded px-3 py-1.5 outline-none focus:border-[#007acc] transition-colors cursor-pointer"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                </select>

                {/* Run Code Button */}
                <button
                    onClick={onRunCode}
                    className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm font-medium font-sans px-4 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                    ▶ Run Code
                </button>
            </div>

            {/* Center — Room Info (Original font family kept, size increased) */}
            <div className="flex items-center gap-3 font-sans">
                <span className="text-[#858585] text-sm">// Room:</span>
                
                <span 
                    className={`text-sm font-normal bg-[#252526] border px-3 py-0.5 rounded transition-colors duration-300 ${
                        isCopied 
                            ? 'text-[#007acc] border-[#007acc]' 
                            : 'text-[#cccccc] border-[#3c3c3c]'
                    }`}
                >
                    {roomId}
                </span>
                
                <button
                    onClick={handleCopyClick}
                    className="text-sm text-[#007acc] hover:text-[#1177bb] transition-colors font-medium cursor-pointer"
                >
                    {isCopied ? 'Copied' : 'Copy'}
                </button>
            </div>

            {/* Right — Active Users & Chat Toggle */}
            <div className="flex items-center gap-4 font-sans">
                <div className="flex items-center gap-1.5">
                    {users.slice(0, 3).map((user, i) => (
                        <div
                            key={i}
                            title={user.username}
                            className="w-7 h-7 rounded-full bg-[#007acc] border border-[#3c3c3c] flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        >
                            {user.username?.[0]?.toUpperCase()}
                        </div>
                    ))}
                    {users.length > 3 && (
                        <span className="text-[#858585] text-xs font-mono">+{users.length - 3}</span>
                    )}
                </div>

                <span className="text-[#cccccc] text-sm font-mono font-medium">{username}</span>

                <button
                    onClick={onToggleSidebar}
                    className="text-xs text-[#cccccc] hover:text-white bg-[#252526] hover:bg-[#333333] border border-[#3c3c3c] px-3 py-1.5 rounded transition-colors font-medium cursor-pointer"
                >
                    {showSidebar ? 'Hide Panel' : 'Show Panel'}
                </button>
            </div>

        </div>
    );
}

export default Navbar;