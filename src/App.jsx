import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import MainPage from './pages/MainPage';
import SqlPage from './pages/SqlPage';
import Workspace from './pages/Workspace';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Intro" element={<IntroPage />} />
        <Route path="/Main" element={<MainPage />} />
        <Route path='/Sql' element={<SqlPage/>}/>
        <Route path='/Work' element={<Workspace/>}/>
      </Routes>
    </Router>
  );
}

export default App;