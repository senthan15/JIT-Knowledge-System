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

    // Custom renderer for citations
    const renderText = (text) => {
        if (!text) return null;
        // Regex for [Source: ..., Page: ...]
        // We split by the regex but capture the group so we can map over it
        const parts = text.split(/(\[Source: .*?, Page: \d+\])/g);
        return parts.map((part, index) => {
            if (part.match(/^\[Source: .*?, Page: \d+\]$/)) {
                return (
                    <span key={index} className="citation-chip" title="Click to view source (mock)">
                        {part}
                    </span>
                );
            }
            // Render markdown for non-citation parts
            return <span key={index}><ReactMarkdown components={{ p: 'span' }}>{part}</ReactMarkdown></span>;
        });
    };

    return (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chat-history">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            {msg.role === 'model' && <Bot size={20} style={{ marginTop: '2px' }} />}
                            <div style={{ flex: 1 }}>
                                {renderText(msg.text)}
                            </div>
                            {msg.role === 'user' && <User size={20} style={{ marginTop: '2px' }} />}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message bot">
                        <div className="loading-dots">Thinking</div>
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
