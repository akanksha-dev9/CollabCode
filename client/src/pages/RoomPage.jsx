import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket/socket';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TerminalComponent from '../components/Terminal';
import axios from 'axios';

function RoomPage() {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username;
    const terminalRef = useRef(null);

    const [code, setCode] = useState('// Start coding here...');
    const [language, setLanguage] = useState('javascript');
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);

    const [output, setOutput] = useState('');
    const [outputError, setOutputError] = useState(false);
    const [outputLoading, setOutputLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        // Agar username nahi hai toh home pe bhejo
        if (!username) {
            navigate('/');
            return;
        }

        // Socket connect karo
        socket.connect();

        // Room join karo
        socket.emit('join-room', { roomId, username });

        // Server se current code lo
        socket.on('load-document', ({ code, language }) => {
            setCode(code);
            setLanguage(language);
            if (chat) setMessages(chat);  // Agar chat history hai toh set karo
        });

        socket.on('language-updated', ({ language }) => {
            setLanguage(language);
        });

        // Doosre user ne code change kiya
        socket.on('code-update', ({ operation }) => {
            if (operation?.content !== undefined) {
                setCode(operation.content);
            }
        });

        // Users list update
        socket.on('users-update', (updatedUsers) => {
            setUsers(updatedUsers);
        });

        // Chat message aaya
        socket.on('receive-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // User joined notification
        socket.on('user-joined', ({ username: joinedUser }) => {
            setMessages((prev) => [
                ...prev,
                { user: 'System', message: `${joinedUser} joined the room`, timestamp: new Date() }
            ]);
        });

        // User left notification
        socket.on('user-left', ({ username: leftUser }) => {
            setMessages((prev) => [
                ...prev,
                { user: 'System', message: `${leftUser} left the room`, timestamp: new Date() }
            ]);
        });

        // Cleanup on unmount
        return () => {
            socket.off('load-document');
            socket.off('code-update');
            socket.off('users-update');
            socket.off('receive-message');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('language-updated');
            socket.disconnect();
        };
    }, [roomId, username, navigate]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socket.emit('code-change', {
            roomId,
            operation: { content: newCode },
            revision: 0
        });
    };

    const handleSendMessage = (message) => {
        socket.emit('send-message', { roomId, message });
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
    };

    const handleRunCode = () => {
        setShowOutput(true);
        terminalRef.current?.run();
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        socket.emit('language-change', { roomId, language: newLanguage });
    };

    return (
        <div className="h-screen bg-[#1e1e2e] flex flex-col overflow-hidden">

            <Navbar
                roomId={roomId}
                username={username}
                language={language}
                setLanguage={handleLanguageChange}
                users={users}
                onCopyRoomId={copyRoomId}
                onToggleSidebar={() => setShowSidebar(!showSidebar)}
                showSidebar={showSidebar}
                onRunCode={handleRunCode}
            />

            <div className="flex flex-1 overflow-hidden">

                <div className="flex flex-col flex-1 overflow-hidden">
                    <Editor
                        code={code}
                        language={language}
                        onChange={handleCodeChange}
                    />
                    <div className={showOutput ? "block" : "hidden"}>
                        <TerminalComponent
                            ref={terminalRef}
                            code={code}
                            language={language}
                            onClose={() => setShowOutput(false)}
                        />
                    </div>
                </div>

                {showSidebar && (
                    <Sidebar
                        messages={messages}
                        username={username}
                        users={users}
                        onSendMessage={handleSendMessage}
                    />
                )}

            </div>
        </div>
    );
}

export default RoomPage;