import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import MainPage from './pages/MainPage';
import SqlPage from './pages/SqlPage';
import Workspace from './pages/Workspace';
import ThemePage from './pages/ThemePage';
import Game from './pages/Game';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Intro" element={<IntroPage />} />
        <Route path="/Main" element={<MainPage />} />
        <Route path='/Sql' element={<SqlPage/>} />
        <Route path='/workspace' element={<Workspace/>} />
        <Route path='/Game/:id' element={<Game/>} />
        <Route path='/theme/:theme' element={<ThemePage/>} />
      </Routes>
    </Router>
  );
}

export default App;