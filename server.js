// Load environment variables
require('dotenv').config();

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Connection
const username = process.env.MONGO_USER;
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = process.env.MONGO_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=EvaChatbot`;

const client = new MongoClient(uri);
let chat_collection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db('chatbotDB');
        chat_collection = db.collection('chatMessages');
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

app.prepare().then(() => {
    connectDB();
    
    const server = createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
    });

    // Initialize Socket.IO
    const io = new Server(server);

    // WebSocket Logic
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Room joining logic
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
            
            // Notify user that admin has connected
            io.to(roomId).emit('admin_connected');
        });

        // Message handling
        socket.on('send_message', async (data) => {
            const { roomId, sender, text } = data;
            console.log(`Message from ${sender} in room ${roomId}: ${text}`);
            
            const messageData = {
                user_id: roomId,
                sender: sender,
                text: text,
                timestamp: new Date()
            };
            
            // Save message to DB
            await chat_collection.insertOne(messageData);
            console.log(`Message saved to DB for room ${roomId}`);

            // Broadcast message to the room
            io.to(roomId).emit('receive_message', messageData);
            console.log(`Message broadcasted to room ${roomId}`);
        });

        // Admin ends chat
        socket.on('end_chat', (roomId) => {
            console.log(`Admin ended chat for room: ${roomId}`);
            io.to(roomId).emit('chat_ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
