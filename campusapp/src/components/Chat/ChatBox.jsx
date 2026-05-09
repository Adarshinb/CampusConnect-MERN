import React, { useState, useEffect, useRef } from 'react';
import { 
  Avatar, Box, IconButton, TextField, Typography, Divider,
  Paper, styled, Badge 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const MessageArea = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '16px',
  backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png")',
  backgroundRepeat: 'repeat',
  backgroundColor: '#dad4cfff',
});

const MessageBubble = styled(Box)(({ theme, isCurrentUser }) => ({
  maxWidth: '70%',
  padding: '8px 12px',
  borderRadius: isCurrentUser 
    ? '18px 18px 0 18px' 
    : '18px 18px 18px 0',
  backgroundColor: isCurrentUser 
    ? '#d9fdd3' 
    : theme.palette.background.paper,
  color: theme.palette.text.primary,
  marginBottom: '8px',
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)',
  position: 'relative',
  wordBreak: 'break-word',
}));

const TimeStamp = styled(Typography)(({ isCurrentUser }) => ({
  display: 'inline-block',
  fontSize: '0.6875rem',
  color: isCurrentUser ? '#00a884' : '#667781',
  marginLeft: '8px',
  verticalAlign: 'bottom',
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const location = useLocation();
  const recipientId = location.state?.recipientId;

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3006', {
      withCredentials: true,
      extraHeaders: { "my-custom-header": "abcd" }
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Join room after both socket & user are ready
  useEffect(() => {
    if (socket && currentUser?._id) {
      socket.emit('join', { userId: currentUser._id });
    }
  }, [socket, currentUser]);

  // Fetch recipient & chat history
  useEffect(() => {
    if (!recipientId || !currentUser?._id) return;

    const fetchData = async () => {
      try {
        const [recipientRes, messagesRes] = await Promise.all([
          axios.get(`http://localhost:3006/api/user/${recipientId}`),
          axios.get(`http://localhost:3006/api/user/chat/${currentUser._id}/${recipientId}`)
        ]);

        setRecipient(recipientRes.data);
        setMessages(messagesRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [recipientId, currentUser?._id]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setMessages(prev => {
        // avoid duplicates
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('message', handleMessage);
    return () => socket.off('message', handleMessage);
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUser._id,
      recipient: recipientId,
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setNewMessage('');
    socket.emit('sendMessage', message);
  };

  return (
    <Box sx={{ 
      padding: 2,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f0f2f5'
    }}>
      <StyledPaper elevation={0}>
        {/* Header */}
        <Header>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ color: 'inherit', mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          {recipient && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1 
            }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
              >
                <Avatar 
                  src={recipient.profilePic} 
                  sx={{ width: 40, height: 40, mr: 2 }} 
                />
              </Badge>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  {recipient.name}
                </Typography>
                <Typography variant="caption">
                  {recipient.isOnline ? 'Online' : 'Offline'}
                </Typography>
              </Box>
              <IconButton sx={{ color: 'inherit' }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          )}
        </Header>

        {/* Messages */}
        <MessageArea>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column',
              textAlign: 'center'
            }}>
              <Avatar 
                src={recipient?.profilePic} 
                sx={{ width: 80, height: 80, mb: 2 }} 
              />
              <Typography variant="h6" color="text.primary">
                {recipient?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Start your conversation with {recipient?.name.split(' ')[0]}
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message) => {
                const isCurrentUser = (message.sender?._id || message.sender) === currentUser._id;
                return (
                  <MessageBubble 
                    key={message._id || message.timestamp}
                    isCurrentUser={isCurrentUser}
                  >
                    <Typography variant="body1" component="span">
                      {message.content}
                    </Typography>
                    <TimeStamp 
                      isCurrentUser={isCurrentUser}
                      component="span"
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </TimeStamp>
                  </MessageBubble>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </MessageArea>

        {/* Input */}
        <InputArea>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            multiline
            maxRows={4}
            sx={{ 
              mr: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'background.paper',
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </InputArea>
      </StyledPaper>
    </Box>
  );
};

export default ChatBox;