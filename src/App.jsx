import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import MainPage from './pages/MainPage';
import SqlPage from './pages/SqlPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Intro" element={<IntroPage />} />
        <Route path="/Main" element={<MainPage />} />
        <Route path='/Sql' element={<SqlPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;