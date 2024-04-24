import React, {useState, useEffect} from 'react';
import {useParams} from "react-router-dom";
import io from 'socket.io-client';
import hljs from "highlight.js";
import 'highlight.js/styles/default.css'
import axios from "axios";
import "./CodeBlockPage.css"

const socket = io.connect(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001')

function CodeBlockPage () {
    const {id} = useParams();

    const [codeBlock, setCodeBlock] = useState(null);
    const [isMentor, setIsMentor] = useState(false);

    useEffect(() => {
        axios.get(`/codeblocks/${id}`)
            .then (response => {
                setCodeBlock(response.data);
                socket.emit('join', id)
            })
            .catch(error => console.error('Error fetching code block: ', error));

        socket.on('code updated', (updatedCode) => {
            setCodeBlock(prev => ({...prev, code:updatedCode}))
        });

        return () => {
            socket.off('code updated');
        };
    }, [id]);

    useEffect(() => {
        hljs.highlightAll()
    }, [codeBlock])

    const handleUpdateCode = (e) => {
        const updatedCode = e.target.value;
        setCodeBlock(prev => ({...prev, code: updatedCode}))
        socket.emit('update code', id, updatedCode)
    }

    return (
        <div className="code-block-container">
            <h2>{codeBlock ? codeBlock.title : 'Loading code block...'}</h2>
            <textarea className="code-block-textarea"
                value={codeBlock ? codeBlock.code : ''}
                onChange={handleUpdateCode}
                readOnly={isMentor}
            />
        </div>
    )
}

export default CodeBlockPage
