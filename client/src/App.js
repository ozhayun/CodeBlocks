import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import CodeBlocksList from './Components/CodeBlocksList';
const LazyCodeBlockPage = React.lazy(() => import('./Components/CodeBlockPage'));

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<CodeBlocksList />} />
            <Route path="/codeblocks/:id" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                    <LazyCodeBlockPage />
                </React.Suspense>
            } />
        </Routes>
      </Router>
  );
}

export default App;
