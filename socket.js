const http = require('http');
const {app, express} = require('./express');
const socketIo = require('socket.io');
// Create your server instance (either with express or standalone)
const server = http.createServer(app); 

const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');
  // ... your socket event handlers ...
});

io.on('connection', (socket) => {
    console.log('Client connected');
  
    // Send a message to the client
    socket.emit('message', { message: 'Hello from the backend!' });
  
    // Handle messages from the client
    socket.on('message', (message) => {
      console.log('Received:', message);
      // Echo the message back to the client
      socket.emit('message', `Server received: ${message}`);
    });
  
    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  
    // Handle errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

// Export the io object
module.exports = { io, server }; // Export both io and the server