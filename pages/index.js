import Head from 'next/head';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({});
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    { text: "👋 Hello! What's your name?", sender: 'bot' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showServiceButtons, setShowServiceButtons] = useState(false);
  const [showCategoryButtons, setShowCategoryButtons] = useState(false);
  const [showSubCategoryButtons, setShowSubCategoryButtons] = useState(false);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [currentSubServices, setCurrentSubServices] = useState([]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // WebSocket initialization function
  const initializeSocket = (userId) => {
    if (socket) {
      socket.close(); // Close existing socket if any
    }

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log("Socket connected, joining room:", userId);
      newSocket.emit('join_room', userId);
      appendMessage("⌛ Waiting for an agent to connect...", 'system');
    });

    newSocket.on('admin_connected', () => {
      appendMessage("✅ An agent has connected! You can now chat.", 'system');
      setInputEnabled(true);
    });

    newSocket.on('receive_message', (data) => {
      console.log('Received message:', data);
      if (data.sender === 'admin') {
        appendMessage(data.text, 'admin');
      }
    });

    newSocket.on('chat_ended', () => {
      appendMessage("The chat has been ended by the agent.", 'system');
      setInputEnabled(false);
      showFeedbackOptions();
    });

    return () => newSocket.close();
  };

  const appendMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const showTyping = (callback) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 700);
  };

  const handleInput = () => {
    if (step <= 3) {
      handleInitialInput();
    } else {
      handleLiveChatMessage();
    }
  };

  const handleInitialInput = () => {
    const message = userInput.trim();
    if (!message) return;

    appendMessage(message, 'user');
    setUserInput('');

    switch (step) {
      case 0: // Name
        if (!/^[A-Za-z ]{2,}$/.test(message)) {
          appendMessage("⚠️ Please enter a valid name.", 'error');
          return;
        }
        setUserData(prev => ({ ...prev, name: message }));
        showTyping(() => {
          appendMessage(`Nice to meet you, ${message}! What's your phone number?`);
          setStep(1);
        });
        break;

      case 1: // Phone
        if (!/^\d{10}$/.test(message)) {
          appendMessage("⚠️ Enter a valid 10-digit phone number.", 'error');
          return;
        }
        setUserData(prev => ({ ...prev, number: message }));
        showTyping(() => {
          appendMessage("Got it. What's your email?");
          setStep(2);
        });
        break;

      case 2: // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
          appendMessage("⚠️ Enter a valid email address.", 'error');
          return;
        }
        setUserData(prev => ({ ...prev, email: message }));
        showTyping(() => {
          appendMessage("Thanks! What's your organization name?");
          setStep(3);
        });
        break;

      case 3: // Organization
        if (message.length < 2) {
          appendMessage("⚠️ Organization name is too short.", 'error');
          return;
        }
        setUserData(prev => ({ ...prev, organization: message }));
        showTyping(() => {
          appendMessage("Would you like to explore our services?");
          setShowServiceButtons(true);
          setInputEnabled(false);
          setStep(4);
        });
        break;
    }
  };

  const handleServiceChoice = (choice) => {
    appendMessage(choice, 'user');
    setShowServiceButtons(false);
    
    if (choice === 'Yes') {
      showTyping(() => {
        appendMessage("Great! Here are our main service categories:");
        setShowCategoryButtons(true);
      });
    } else {
      showTyping(() => {
        appendMessage("Thank you for connecting with us! Please wait while we connect you to an agent.");
        submitAndConnect();
      });
    }
  };

  const handleCategoryChoice = (category) => {
    appendMessage(category, 'user');
    setUserData(prev => ({ ...prev, service: category }));
    setShowCategoryButtons(false);
    
    const subServices = {
      'Water Testing': ['Drinking Water', 'Swimming Pool Water', 'FSSAI Water'],
      'Food Testing': ['Nutritional Analysis', 'Shelf-life Study', 'Pesticide Residues'],
      'Environmental Testing': ['Ambient Air', 'Noise', 'DG Stack'],
      'Shelf-life Study': ['Ambient Conditions', 'Accelerated Stability'],
      'Others': ['Training', 'Audits', 'PT Services']
    };
    
    setCurrentSubServices(subServices[category]);
    
    showTyping(() => {
      appendMessage("Please choose a sub-service:");
      setShowSubCategoryButtons(true);
    });
  };

  const handleSubCategoryChoice = (subCategory) => {
    appendMessage(subCategory, 'user');
    setUserData(prev => ({ ...prev, subService: subCategory }));
    setShowSubCategoryButtons(false);
    
    showTyping(() => {
      appendMessage("✅ Thank you! Your details are saved. Please wait while we connect you to an agent.");
      submitAndConnect();
    });
  };

  const submitAndConnect = async () => {
    setInputEnabled(false);
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.userId) {
        setUserData(prev => ({ ...prev, id: data.userId }));
        // Initialize socket immediately after getting userId
        initializeSocket(data.userId);
      } else {
        appendMessage("Sorry, there was an error saving your details.", 'error');
      }
    } catch (err) {
      console.error("Error in submitAndConnect:", err);
      appendMessage(`Could not connect to the server. ${err.message}`, 'error');
    }
  };

  const handleLiveChatMessage = () => {
    const message = userInput.trim();
    if (!message || !socket) {
      console.log('Cannot send message - no message or no socket:', { message, socket: !!socket });
      return;
    }

    appendMessage(message, 'user');
    setUserInput('');

    console.log('Sending message:', { roomId: userData.id, sender: 'user', text: message });
    socket.emit('send_message', {
      roomId: userData.id,
      sender: 'user',
      text: message
    });
  };

  const showFeedbackOptions = () => {
    appendMessage("Please rate your experience with the agent:", "system");
    setShowFeedbackButtons(true);
  };

  const handleFeedback = async (feedbackChoice) => {
    appendMessage(feedbackChoice, 'user');
    setShowFeedbackButtons(false);
    const feedbackLabel = feedbackChoice.substring(feedbackChoice.indexOf(' ') + 1);
    
    try {
      await fetch('/api/update-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: userData.number,
          feedback: feedbackLabel
        })
      });
      appendMessage("🎉 Thank you for your feedback! Have a great day!", "bot");
    } catch (err) {
      console.error("Error updating feedback:", err);
    }
  };

  const ChoiceButtons = ({ options, onChoice }) => (
    <div className="button-container">
      {options.map((option, index) => (
        <button
          key={index}
          className="option-btn"
          onClick={() => onChoice(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderChoiceButtons = () => {
    if (showServiceButtons) {
      return <ChoiceButtons options={['Yes', 'No']} onChoice={handleServiceChoice} />;
    }
    
    if (showCategoryButtons) {
      const services = ['Water Testing', 'Food Testing', 'Environmental Testing', 'Shelf-life Study', 'Others'];
      return <ChoiceButtons options={services} onChoice={handleCategoryChoice} />;
    }
    
    if (showSubCategoryButtons && currentSubServices.length > 0) {
      return <ChoiceButtons options={currentSubServices} onChoice={handleSubCategoryChoice} />;
    }
    
    if (showFeedbackButtons) {
      const feedbackOptions = [
        '😊 Very Helpful',
        '🙂 Good',
        '😐 Average',
        '😞 Needs Improvement'
      ];
      return <ChoiceButtons options={feedbackOptions} onChoice={handleFeedback} />;
    }
    
    return null;
  };

  return (
    <>
      <Head>
        <title>Eva – Envirocare Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="chat-wrapper">
        <div className="chat-header">
          <img src="/bot-icon.svg" alt="Bot Icon" />
          <span>Eva – Envirocare Chatbot</span>
        </div>

        <div className="chat-display">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.sender === 'admin' ? (
                <><strong>Admin:</strong> {msg.text}</>
              ) : (
                msg.text
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              Eva is typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          )}
          
          {renderChoiceButtons()}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInput()}
            placeholder={inputEnabled ? "Type your response..." : "Connecting..."}
            disabled={!inputEnabled}
          />
          <button onClick={handleInput} disabled={!inputEnabled}>
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(to bottom right, #f0f4f8, #e8f0fe);
          font-family: 'Segoe UI', sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          height: 100vh;
        }

        .chat-wrapper {
          width: 360px;
          height: 540px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-bottom: 30px;
          animation: fadeInUp 0.5s ease;
        }

        .chat-header {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          color: white;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }

        .chat-header img {
          height: 26px;
          width: 26px;
          border-radius: 50%;
          background: white;
        }

        .chat-display {
          flex: 1;
          padding: 18px;
          background-color: #f9fbfc;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          position: relative;
          animation: fadeInUp 0.3s ease-in-out;
        }

        .bot, .system {
          background-color: #eff2f7;
          color: #222;
          align-self: flex-start;
          border-top-left-radius: 0;
        }

        .user {
          background-color: #2563eb;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 0;
        }

        .admin {
          background-color: #bee3f8;
          color: #222;
          align-self: flex-start;
          border-top-left-radius: 0;
        }

        .error {
          background-color: #fee2e2;
          color: #b91c1c;
          align-self: flex-start;
          font-style: italic;
        }

        .chat-footer {
          padding: 14px 16px;
          background: #ffffff;
          display: flex;
          border-top: 1px solid #e2e8f0;
        }

        .chat-footer input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 30px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          background-color: #f8fafc;
          outline: none;
          transition: box-shadow 0.2s ease;
        }

        .chat-footer input:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .chat-footer input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-footer button {
          margin-left: 10px;
          padding: 12px 20px;
          background: linear-gradient(to right, #2563eb, #1e40af);
          color: white;
          font-size: 14px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .chat-footer button:hover:not(:disabled) {
          background: #1e3a8a;
        }

        .chat-footer button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .option-btn {
          background-color: white;
          border: 2px solid #2563eb;
          color: #2563eb;
          padding: 10px 16px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-btn:hover {
          background-color: #e6f0ff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .typing-indicator {
          font-style: italic;
          color: #888;
          margin: 8px;
        }

        .dot {
          animation: blink 1s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
