import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import MainPage from './pages/MainPage';
import SocialAuthHandler from './pages/SocialAuthHandler';
import Workspace from './pages/Workspace';
import ThemePage from './pages/ThemePage';
import Game from './pages/Game';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Intro" replace />} />
        <Route path="/Intro" element={<IntroPage />} />
        <Route path="/Main" element={<MainPage />} />
        <Route path="/auth/kakao" element={<SocialAuthHandler />} />
        <Route path="/auth/naver" element={<SocialAuthHandler />} />
        <Route path="/auth/google" element={<SocialAuthHandler />} />
        <Route path="/Theme/:theme" element={<ThemePage />} />
        <Route path='/workspace' element={<Workspace/>} />
        <Route path='/Game/:id' element={<Game/>} />
      </Routes>
    </Router>
  );
}

export default App;