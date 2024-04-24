import React, {useState, useEffect, useRef} from 'react';
import {useParams} from "react-router-dom";
import io from 'socket.io-client';
import hljs from "highlight.js";
import 'highlight.js/styles/default.css'
import axios from "axios";
import "./CodeBlockPage.css"

function CodeBlockPage () {
    const {id} = useParams();

    const [codeBlock, setCodeBlock] = useState(null);
    const [role, setRole] = useState('student');
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io.connect(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
            withCredentials: true,
            transports: ['websocket']
        });

        socket.current.on('role', ({ role }) => {
            console.log('Assigned role:', role);
            setRole(role);
        });

        socket.current.on('code updated', (updatedCode) => {
            setCodeBlock(prev => ({...prev, code: updatedCode}));
        });

        socket.current.emit('join', id);

        axios.get(`/codeblocks/${id}`)
            .then(response => {
                setCodeBlock(response.data);
            })
            .catch(error => console.error('Error fetching code block: ', error));

        return () => {
            if (socket.current) {
                socket.current.off('role');
                socket.current.off('code updated');
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, [id]);


    useEffect(() => {
        hljs.highlightAll()
    }, [codeBlock])

    const handleUpdateCode = (e) => {
        console.log("Role!!!", role)
        if (role !== 'mentor') {
            const updatedCode = e.target.value;
            setCodeBlock(prev => ({...prev, code: updatedCode}));
            if (socket.current) {
                socket.current.emit('update code', id, updatedCode);
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
        </div>
    )
}

export default CodeBlockPage
