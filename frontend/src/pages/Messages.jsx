import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getConversations, getMessages, sendMessage } from '../utils/api';

const Messages = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Initial load: fetch conversations
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Handle redirect from other pages (e.g., "Message Seller")
    useEffect(() => {
        if (location.state && location.state.sellerId) {
            // Check if conversation exists, if not, create a temp one or select it
            const sellerId = location.state.sellerId;
            // Ideally, we should fetch conversations and find this user.
            // For now, let's assume we can just set activeChat if we have the details.
            // But we need the user object.
            // Let's rely on fetchConversations finding it, or if it's a new chat, we might need to handle that.
            // A simpler way: If we have sellerId, we can fetch messages directly even if no conversation exists yet?
            // But getMessages needs userId.
            // Let's just set activeChat with minimal info if not found in list.
            if (location.state.sellerName) {
                setActiveChat({
                    id: sellerId,
                    username: location.state.sellerName,
                    profile_picture: location.state.sellerImage
                });
            }
        }
    }, [location.state]);

    // Fetch messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            const interval = setInterval(() => fetchMessages(activeChat.id), 3000); // Poll messages every 3s
            return () => clearInterval(interval);
        }
    }, [activeChat]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const data = await getMessages(userId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            await sendMessage({
                receiver_id: activeChat.id,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages(activeChat.id);
            fetchConversations(); // Update last message in list
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '2rem', height: '100vh', overflow: 'hidden', display: 'flex', gap: '1rem' }}>
            {/* Sidebar */}
            <div className="card" style={{ width: '300px', padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0 }}>Messages</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveChat(conv)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                background: activeChat?.id === conv.id ? 'var(--muted)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#ccc' }}>
                                {conv.profile_picture ? (
                                    <img src={conv.profile_picture} alt={conv.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {conv.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 'bold' }}>{conv.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {conv.last_message}
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div style={{ padding: '1rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                            No conversations yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
                {activeChat ? (
                    <>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#ccc' }}>
                                {activeChat.profile_picture ? (
                                    <img src={activeChat.profile_picture} alt={activeChat.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {activeChat.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h3 style={{ margin: 0 }}>{activeChat.username}</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '1rem',
                                            background: isMe ? 'var(--primary)' : 'var(--muted)',
                                            color: isMe ? 'var(--primary-foreground)' : 'var(--foreground)',
                                            borderBottomRightRadius: isMe ? '0' : '1rem',
                                            borderBottomLeftRadius: isMe ? '1rem' : '0'
                                        }}>
                                            {msg.content}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--input)', background: 'var(--background)', color: 'var(--foreground)' }}
                            />
                            <button type="submit" className="btn btn-primary">Send</button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
