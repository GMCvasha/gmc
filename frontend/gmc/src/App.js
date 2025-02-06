import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';

import RequireAuth from './RequireAuth'; // Import the authentication check component
import Login from './components/login';
import Register from './components/Register';
import Dash from './components/dash';
import Verification from './components/Verification';
import Success from './components/Success';
import Imageform from './components/imageform';
import Imagedisplay from './components/imagedisplay';
import Cal from './components/cal';


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
          <Route path="/imageform" element={<Imageform />} />
          <Route path="/images" element={<Imagedisplay />} />
          
          <Route path="/success" element={<Success />} />
          <Route path="/verification" element={<Verification />} />

          <Route path="/cal" element={<Cal />} />
          
          {/* Protected routes */}
          <Route element={<RequireAuth />} >

          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
