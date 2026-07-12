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
    <div className="min-h-screen bg-[#1e1e2e] flex items-center justify-center px-4">
      <div className="bg-[#313244] rounded-2xl p-10 w-full max-w-md shadow-2xl flex flex-col gap-4">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-[#cba6f7]">CollabCode</h1>
          <p className="text-sm text-[#a6adc8] mt-1">Real-time collaborative code editor</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[#f38ba8] text-sm text-center bg-[#f38ba8]/10 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Username Input */}
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(''); }}
          className="bg-[#1e1e2e] text-[#cdd6f4] placeholder-[#6c7086] border border-[#45475a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#cba6f7] transition-colors"
        />

        {/* Create Room Button */}
        <button
          onClick={createRoom}
          disabled={loading}
          className="bg-[#cba6f7] text-[#1e1e2e] font-semibold py-3 rounded-lg hover:bg-[#b794f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create New Room'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#45475a]"/>
          <span className="text-[#6c7086] text-xs">or join existing room</span>
          <div className="flex-1 h-px bg-[#45475a]"/>
        </div>

        {/* Room ID Input */}
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => { setRoomId(e.target.value); setError(''); }}
          className="bg-[#1e1e2e] text-[#cdd6f4] placeholder-[#6c7086] border border-[#45475a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#cba6f7] transition-colors"
        />

        {/* Join Room Button */}
        <button
          onClick={joinRoom}
          disabled={loading}
          className="border border-[#cba6f7] text-[#cba6f7] font-semibold py-3 rounded-lg hover:bg-[#cba6f7]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>

      </div>
    </div>
  );
}

export default Home;