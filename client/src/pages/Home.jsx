import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!username.trim()) {
      setError('Username daalo pehle');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/room/create', {
        username
      });
      navigate(`/room/${res.data.roomId}`, {
        state: { username }
      });
    } catch (err) {
      setError('Room create nahi hua, server check karo');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!username.trim() || !roomId.trim()) {
      setError('Username aur Room ID dono daalo');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/room/${roomId}`);
      if (res.data.success) {
        navigate(`/room/${roomId}`, {
          state: { username }
        });
      }
    } catch (err) {
      setError('Room nahi mila, Room ID check karo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#cccccc] flex items-center justify-center p-4 font-mono antialiased">
      <div className="w-full max-w-md bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Terminal Header Bar */}
        <div className="bg-[#1e1e1e] px-4 py-3 border-b border-[#3c3c3c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
          </div>
          <span className="text-xs text-[#858585]">collabcode ~ terminal</span>
        </div>

        <div className="p-8 flex flex-col gap-6">

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-[#007acc] tracking-tight">
              &lt;CollabCode /&gt;
            </h1>
            <p className="text-xs text-[#858585] mt-1.5 font-sans">
              Real-time collaborative code editor
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#f14c4c]/10 border border-[#f14c4c]/30 text-[#f14c4c] text-xs font-sans p-3 rounded-md text-center">
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4 font-sans">
            
            {/* Username Input */}
            <div>
              <label className="text-xs text-[#858585] mb-1 block font-mono">
                // USERNAME
              </label>
              <input
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-[#1e1e1e] text-[#cccccc] placeholder-[#555555] border border-[#3c3c3c] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-[#007acc] transition-colors"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white font-medium py-2.5 rounded-md text-sm transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Creating...' : '+ Create New Room'}
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[#3c3c3c]" />
              <span className="text-[#666666] text-xs font-mono">OR</span>
              <div className="flex-1 h-px bg-[#3c3c3c]" />
            </div>

            {/* Room ID Input */}
            <div>
              <label className="text-xs text-[#858585] mb-1 block font-mono">
                // ROOM_ID
              </label>
              <input
                type="text"
                placeholder="Enter room code..."
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value); setError(''); }}
                className="w-full bg-[#1e1e1e] text-[#cccccc] placeholder-[#555555] border border-[#3c3c3c] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-[#007acc] transition-colors"
              />
            </div>

            {/* Join Button */}
            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#cccccc] font-medium py-2.5 rounded-md text-sm border border-[#555555] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : '➔ Join Room'}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;