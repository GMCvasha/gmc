import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';

import RequireAuth from './RequireAuth'; // Import the authentication check component
import Login from './components/login';
import Register from './components/Register';
import Dash from './components/dash';


const socket = io('https://elosystemv1.onrender.com');

const App = () => {


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}

          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dash" element={<Dash />} />

          {/* Protected routes */}
          <Route element={<RequireAuth />} >

          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
