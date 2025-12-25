import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function ChatInterface({ context, uploadedFiles }) {
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hello! I'm your JIT Policy Assistant. I'm aware of the current case context. How can I help you?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substr(2, 9));
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/chat', {
                message: userMsg.text,
                context,
                files: uploadedFiles,
                sessionId
            });

            const botMsg = { role: 'model', text: response.data.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error", error);
            const errorMsg = error.response?.data?.error || "Error: Could not retrieve response. Ensure backend is running and API key is set.";
            setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    // Process text to highlight citations
    const processCitations = (text) => {
        if (!text) return text;
        // Convert citation format to styled markdown-like format
        return text.replace(
            /\[Source: (.*?), Page: (\d+)\]/g,
            '`📄 $1 | Page $2`'
        );
    };

    return (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chat-history">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        <div className="message-header">
                            {msg.role === 'model' && <Bot size={18} />}
                            <span className="message-role">{msg.role === 'model' ? 'Assistant' : 'You'}</span>
                            {msg.role === 'user' && <User size={18} />}
                        </div>
                        <div className="message-content">
                            {msg.role === 'user' ? (
                                <p>{msg.text}</p>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                                        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                                        p: ({ children }) => <p className="md-p">{children}</p>,
                                        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                                        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                                        li: ({ children }) => <li className="md-li">{children}</li>,
                                        strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                                        em: ({ children }) => <em className="md-em">{children}</em>,
                                        code: ({ children }) => <code className="md-code">{children}</code>,
                                        hr: () => <hr className="md-hr" />,
                                        blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                                    }}
                                >
                                    {processCitations(msg.text)}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message bot">
                        <div className="message-header">
                            <Bot size={18} />
                            <span className="message-role">Assistant</span>
                        </div>
                        <div className="message-content">
                            <div className="loading-dots">Thinking</div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                <input
                    className="input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask a question about the policy..."
                    disabled={loading}
                />
                <button className="btn-primary" onClick={sendMessage} disabled={loading}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
