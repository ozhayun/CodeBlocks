import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import CodeBlocksList from './Components/CodeBlocksList';
import CodeBlockPage from './Components/CodeBlockPage';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<CodeBlocksList />} />
            <Route path="/codeblocks/:id" element={<CodeBlockPage />} />
        </Routes>
      </Router>
  );
}

export default App;
