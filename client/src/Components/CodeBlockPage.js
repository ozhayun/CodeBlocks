import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
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

    useEffect(() => {
        const currentSocket = io.connect(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
            withCredentials: true,
            transports: ['websocket']
        });
        socket.current = currentSocket;

        currentSocket.on('role', ({ role }) => {
            console.log('Assigned role:', role);
            setRole(role);
        });

        currentSocket.on('code updated', (updatedCode) => {
            setCodeBlock(prev => ({ ...prev, code: updatedCode }));
        });

        currentSocket.on('solution matched', (isCorrect) => {
            console.log('Solution matched event received:', isCorrect);
            setIsCodeCorrect(isCorrect);
        });

        currentSocket.emit('join', id);

        axios.get(`/codeblocks/${id}`)
            .then(response => {
                setCodeBlock(response.data);
                if (response.data.code === response.data.solution) {
                    socket.current.emit('correct solution', id);
                }            })
            .catch(error => console.error('Error fetching code block: ', error));

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

    const handleUpdateCode = (e) => {
        if (role !== 'mentor') {
            const updatedCode = e.target.value;
            setCodeBlock(prev => ({ ...prev, code: updatedCode }));
            const isCorrect = updatedCode === codeBlock.solution;
            setIsCodeCorrect(isCorrect);

            if (socket.current) {
                console.log("Sending update code event");
                socket.current.emit('update code', id, updatedCode);
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
            <h2>{codeBlock ? codeBlock.title : 'Loading code...'}</h2>
            <textarea className="code-block-textarea"
                      value={codeBlock ? codeBlock.code : ''}
                      onChange={handleUpdateCode}
                      readOnly={role === 'mentor'}
            />
            {isCodeCorrect && (
                <span className="smiley-face" role="img" aria-label="Smiley face">😊</span>
            )}
        </div>
    );
}

export default CodeBlockPage;
