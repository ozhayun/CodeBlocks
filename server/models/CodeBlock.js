const mongoose = require('mongoose');

const codeBlockSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    solution: { type: String, required: false }
});

const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema, 'CodeDB');

module.exports = CodeBlock;
