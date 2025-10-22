import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import MainPage from './pages/MainPage';
import SocialAuthHandler from './pages/SocialAuthHandler';
import ThemePage from './pages/ThemePage';
import Workspace from './pages/Workspace';
import PlayPage from './pages/PlayPage';
import EditorPage from './pages/EditorPage';
import Temp from './pages/Temp';

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
        <Route path='/Theme/workspace' element={<Workspace/>} />
        <Route path='/Theme/Editor' element={<EditorPage/>} />
        <Route path='/Theme/:theme/Play/:id' element={<PlayPage/>} />
        <Route path="/temp" element={<Temp></Temp>} />
      </Routes>
    </Router>
  );
}

export default App;