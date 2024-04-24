import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./CodeBlocksList.css"

const baseURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
axios.defaults.baseURL = baseURL;

function CodeBlocksList() {
    const [codeBlocks, setCodeBlocks] = useState([]);

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            console.log("Fetching code blocks from the database...");
            try {
                const response = await axios.get(`${baseURL}/codeblocks`);
                console.log("Data received:", response.data);
                setCodeBlocks(response.data);
            } catch (error) {
                console.error('Error fetching code blocks:', error);
            }
        };

        fetchCodeBlocks();
    }, []);

    return (
        <div className="code-blocks-container">
            <h1>Code Blocks List</h1>
            <div className="code-blocks-grid">
                {codeBlocks.map((block, index) => (
                    <Link key={index} to={`/codeblocks/${block._id}`} className="code-block-link">
                        <div className="code-block">
                            <h3>{block.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CodeBlocksList;
