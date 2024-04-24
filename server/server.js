require('dotenv').config();
const express = require('express');
const cors = require('cors');
const CodeBlock = require('./models/CodeBlock');
const mongoose = require("mongoose");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const usersTrack = {}

const corsOptions = {
    origin: ['https://codeblocksharing.netlify.app', 'http://localhost:3000'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

io.on('connection', (socket) => {
    socket.on('join', (codeBlockId) => {
        if (!usersTrack[codeBlockId]) {
            console.log('Assigning first user as mentor');
            usersTrack[codeBlockId] = { count: 1, isMentor: true };
            socket.emit('role', { role: 'mentor' });
        } else {
            console.log('Assigning new user as student');
            usersTrack[codeBlockId].count++;
            socket.emit('role', { role: 'student' });
        }
        socket.join(codeBlockId);
        socket.codeBlockId = codeBlockId;
    });

    socket.on('update code', (codeBlockId, newCode) => {
        socket.to(codeBlockId).emit('code updated', newCode);
    })

    socket.on('disconnect', () => {
        const { codeBlockId } = socket;
        if (usersTrack[codeBlockId]) {
            usersTrack[codeBlockId].count--;
            if (usersTrack[codeBlockId].isMentor && usersTrack[codeBlockId].count > 0) {
                usersTrack[codeBlockId].isMentor = false;
                io.in(codeBlockId).fetchSockets().then(sockets => {
                    const newMentorSocket = sockets.find(s => s.id !== socket.id);
                    if (newMentorSocket) {
                        usersTrack[codeBlockId].isMentor = true;
                        newMentorSocket.emit('role', { role: 'mentor' });
                    }
                });
            } else if (usersTrack[codeBlockId].count === 0) {
                delete usersTrack[codeBlockId];
            }
        }
    });
})

// Lobby page
app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Get code blocks from DB
app.get('/codeblocks', async (req, res) => {
    try {
        const blocks = await CodeBlock.find();
        res.json(blocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single code block by ID
app.get('/codeblocks/:id', async (req, res) => {
    try {
        const block = await CodeBlock.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.json(block);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
