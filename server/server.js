require('dotenv').config();
const express = require('express');
const cors = require('cors');
const CodeBlock = require('./models/CodeBlock');
const mongoose = require("mongoose");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const corsOptions = {
    origin: ['https://codeblocksharing.netlify.app', 'http://localhost:3000'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

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
        socket.join(codeBlockId);
    })

    socket.on('update code', (codeBlockId, newCode) => {
        socket.to(codeBlockId).emit('code updated', newCode);
    })
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
