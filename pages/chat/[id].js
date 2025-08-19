import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

export default function ChatView() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatBoxRef = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchUser();
      initializeSocket();
    }
  }, [id, router]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/user/${id}`);
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        loadMessageHistory();
      } else {
        alert('User not found');
        router.push('/admin');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`/api/messages/${id}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const initializeSocket = () => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join_room', id);

    newSocket.on('receive_message', (data) => {
      console.log('Admin received message:', data);
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    return () => newSocket.close();
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const text = adminMessage.trim();
    if (!text || !socket) {
      console.log('Cannot send message - no text or no socket:', { text, socket: !!socket });
      return;
    }

    console.log('Admin sending message:', { roomId: id, sender: 'admin', text: text });
    socket.emit('send_message', {
      roomId: id,
      sender: 'admin',
      text: text
    });

    setAdminMessage('');
  };

  const endChat = () => {
    if (confirm("Are you sure you want to end this chat?")) {
      socket.emit('end_chat', id);
      alert('Chat ended successfully');
      router.push('/admin');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <>
      <Head>
        <title>💬 Live Chat with {user.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="chat-container">
        <h2>💬 Live Chat with {user.name} ({user.number})</h2>
        
        <div id="chatBox" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <strong>
                {msg.sender === 'admin' ? 'You' : user.name}:
              </strong>
              {' '}{msg.text}
            </div>
          ))}
        </div>
        
        <div className="input-group">
          <input
            type="text"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
          <button id="endChatBtn" onClick={endChat}>End Chat</button>
        </div>
      </div>

      <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
        }

        .chat-container {
          width: 90%;
          max-width: 700px;
          margin: 40px auto;
          background-color: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        #chatBox {
          border: 1px solid #ccc;
          height: 400px;
          overflow-y: auto;
          padding: 15px;
          margin-bottom: 15px;
          background-color: #fafafa;
          border-radius: 8px;
        }

        .message {
          margin: 8px 0;
          padding: 10px 15px;
          border-radius: 15px;
          max-width: 75%;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .user {
          background-color: #dcf8c6;
          text-align: left;
          margin-right: auto;
        }

        .admin {
          background-color: #cdeaff;
          text-align: left;
          margin-left: auto;
        }

        .system {
          font-style: italic;
          text-align: center;
          color: #888;
          font-size: 0.9em;
          background-color: #f0f0f0;
          margin: 0 auto;
        }

        .input-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        input[type="text"] {
          flex: 1;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
          outline: none;
        }

        input[type="text"]:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        button {
          padding: 12px 18px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #0056b3;
        }

        #endChatBtn {
          background-color: #dc3545;
        }

        #endChatBtn:hover {
          background-color: #c82333;
        }

        @media (max-width: 768px) {
          .chat-container {
            width: 95%;
            margin: 20px auto;
            padding: 15px;
          }

          #chatBox {
            height: 300px;
          }

          .input-group {
            flex-direction: column;
            gap: 8px;
          }

          input[type="text"] {
            width: 100%;
            box-sizing: border-box;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
