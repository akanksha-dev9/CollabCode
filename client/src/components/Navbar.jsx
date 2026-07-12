function Navbar({
    roomId, username, language, setLanguage,
    users, onCopyRoomId, onToggleSidebar, showSidebar, onRunCode
}) {
    return (
        <div className="bg-[#181825] border-b border-[#313244] px-4 py-2 flex items-center justify-between">

            {/* Left — Logo */}
            <div className="flex items-center gap-3">
                <h1 className="text-[#cba6f7] font-bold text-lg">CollabCode</h1>

                {/* Language selector */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#313244] text-[#cdd6f4] text-sm border border-[#45475a] rounded px-2 py-1 outline-none"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                </select>
            </div>

            <button
                onClick={onRunCode}
                className="bg-[#a6e3a1] text-[#1e1e2e] text-sm font-semibold px-3 py-1 rounded hover:bg-[#94d49a] transition-colors"
            >
                ▶ Run
            </button>

            {/* Center — Room ID */}
            <div className="flex items-center gap-2">
                <span className="text-[#6c7086] text-xs">Room:</span>
                <span className="text-[#cdd6f4] text-sm font-mono bg-[#313244] px-3 py-1 rounded">
                    {roomId}
                </span>
                <button
                    onClick={onCopyRoomId}
                    className="text-xs text-[#cba6f7] hover:text-[#b794f4] transition-colors"
                >
                    Copy
                </button>
            </div>

            {/* Right — Users + Sidebar toggle */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {users.slice(0, 3).map((user, i) => (
                        <div
                            key={i}
                            title={user.username}
                            className="w-7 h-7 rounded-full bg-[#cba6f7] flex items-center justify-center text-[#1e1e2e] text-xs font-bold"
                        >
                            {user.username?.[0]?.toUpperCase()}
                        </div>
                    ))}
                    {users.length > 3 && (
                        <span className="text-[#6c7086] text-xs">+{users.length - 3}</span>
                    )}
                </div>

                <span className="text-[#a6adc8] text-sm">{username}</span>

                <button
                    onClick={onToggleSidebar}
                    className="text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors border border-[#45475a] px-2 py-1 rounded"
                >
                    {showSidebar ? 'Hide Chat' : 'Show Chat'}
                </button>
            </div>

        </div>
    );
}

export default Navbar;