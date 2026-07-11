import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import UserExtrasPage from './pages/UserExtrasPage';
import PasswordGate from './components/PasswordGate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PasswordGate><MainPage /></PasswordGate>} />
        <Route path="/flatmate1" element={<PasswordGate><UserExtrasPage personKey="matias" /></PasswordGate>} />
        <Route path="/flatmate2" element={<UserExtrasPage personKey="reka" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
