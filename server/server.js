require('dotenv').config();
const express = require('express');
const cors = require('cors');
const CodeBlock = require('./models/CodeBlock');
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


// Get code blocks from DB
app.get('/codeblocks', async (req, res) => {
    console.log(" ")
    console.log("in /codeblocks")
    console.log(" ")

    try {
        const blocks = await CodeBlock.find();
        res.json(blocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lobby page
app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
