import { useState } from 'react';
import api from '../../services/api';
import './NovaAI.css';

const NovaAI = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([
    {
      sender: 'ai',
      text: 'Hi! I am Nova AI. I can help you find artworks, track orders, and answer shopping questions.'
    }
  ]);

  const sendMessage = async (text = message) => {
    if (!text.trim() || loading) return;

    const userText = text.trim();

    setChats((prev) => [...prev, { sender: 'user', text: userText }]);
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userText });

      setChats((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply
        }
      ]);
    } catch (error) {
      setChats((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, Nova AI is not responding right now.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="nova-ai-button" onClick={() => setOpen(true)}>
        💬 Nova AI
      </button>

      {open && (
        <div className="nova-ai-box">
          <div className="nova-ai-header">
            <div>
              <h3>Nova AI Assistant</h3>
              <span>{loading ? 'Thinking...' : 'Shopping helper'}</span>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="nova-ai-quick">
            <button onClick={() => sendMessage('Recommend artwork')}>
              Recommend artwork
            </button>
            <button onClick={() => sendMessage('Track my order')}>
              Track order
            </button>
            <button onClick={() => sendMessage('Payment help')}>
              Payment help
            </button>
          </div>

          <div className="nova-ai-messages">
            {chats.map((chat, index) => (
              <div key={index} className={`nova-msg ${chat.sender}`}>
                {chat.text}
              </div>
            ))}

            {loading && (
              <div className="nova-msg ai">
                Typing...
              </div>
            )}
          </div>

          <div className="nova-ai-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Nova AI..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={() => sendMessage()} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NovaAI;