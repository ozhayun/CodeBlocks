import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import CodeBlocksList from './Components/CodeBlocksList';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<CodeBlocksList />} />
        </Routes>
      </Router>
  );
}

export default App;
