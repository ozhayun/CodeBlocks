# Code Sharing App

This application provides an interactive platform for mentor and students to work on coding challenges together.
It is especially useful for remote sessions, where real-time collaboration is crucial.

## Features

- **Lobby Page**: Users can select from a list of coding challenges.
- **Code Block Page**: Real-time code editing with syntax highlighting, where the first user (mentor) views code in read-only mode, and subsequent users (students) can edit.
- **Database**: Initial code blocks are stored in MongoDB with 'title', 'code', and 'solution' fields.
- **Real-Time Updates**: Implemented using WebSocket via `socket.io`.
- **Syntax Highlighting**: Code blocks are highlighted using Highlight.js.

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Real-Time Communication**: `socket.io`
- **Database**: MongoDB with Mongoose ODM
- **Styling**: CSS with support for responsive design

## Deployment

The application is deployed at https://codeblocksharing.netlify.app.

## GitHub Repository

Find the source code for the application in this GitHub repository: https://github.com/ozhayun/CodeBlocks.

To test the smiley feature, you can check the `MongoDB Initialize Entries.json` file in the repository.
