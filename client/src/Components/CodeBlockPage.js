import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import hljs from "highlight.js";
import 'highlight.js/styles/default.css';
import axios from "axios";
import "./CodeBlockPage.css";

function CodeBlockPage() {
    const { id } = useParams();
    const [codeBlock, setCodeBlock] = useState(null);
    const [role, setRole] = useState('student');
    const [isCodeCorrect, setIsCodeCorrect] = useState(false);
    const socket = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {

        // Create socket connection
        const currentSocket = io.connect(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
            withCredentials: true,
            transports: ['websocket']
        });

        socket.current = currentSocket;

        currentSocket.on('role', ({ role }) => {
            setRole(role);
        });

        currentSocket.on('code updated', (updatedCode) => {
            setCodeBlock(prev => ({ ...prev, code: updatedCode }));
        });

        currentSocket.on('solution matched', (isCorrect) => {
            setIsCodeCorrect(isCorrect);
        });

        currentSocket.emit('join', id);

        // Fetch code block from server by id
        axios.get(`/codeblocks/${id}`)
            .then(response => {
                setCodeBlock(response.data);

                // Emit 'correct solution' event if the code matches the solution
                if (response.data.code === response.data.solution) {
                    socket.current.emit('correct solution', id);
                }
            })
            .catch(error => console.error('Error fetching code block: ', error));

        // Cleanup socket listeners and disconnect
        return () => {
            currentSocket.off('role');
            currentSocket.off('code updated');
            currentSocket.off('solution matched');
            currentSocket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if (codeBlock) {
            hljs.highlightAll();
        }
    }, [codeBlock]);

    // Return to the lobby page
    const goBack = () => {
        navigate('/');
    }

    // Handle code update by the student
    const handleUpdateCode = (e) => {
        if (role !== 'mentor') {
            const updatedCode = e.target.value;
            setCodeBlock(prev => ({ ...prev, code: updatedCode }));
            const isCorrect = updatedCode === codeBlock.solution;
            setIsCodeCorrect(isCorrect);

            // Emit 'update code' event with the new code
            if (socket.current) {
                socket.current.emit('update code', id, updatedCode);

                // Emit 'correct solution' or 'solution no longer correct' event based on code correctness
                if (isCorrect) {
                    socket.current.emit('correct solution', id);
                } else {
                    socket.current.emit('solution no longer correct', id);
                }
            }
        }
    };

    return (
        <div className="code-block-container">
            <button onClick={goBack} className="return-button">Back to lobby</button>
            <h2>{codeBlock ? codeBlock.title : 'Loading code...'}</h2>
            <textarea
                className="code-block-textarea"
                value={codeBlock ? codeBlock.code : ''}
                onChange={handleUpdateCode}
                readOnly={role === 'mentor'}
            />
            <span className={"smiley-face" + (isCodeCorrect ? " visible" : "")} role="img" aria-label="Smiley face">
            😊
            </span>
        </div>
    );
}

export default CodeBlockPage;
