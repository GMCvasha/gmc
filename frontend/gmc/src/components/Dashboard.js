import { useState } from 'react';
import EventPage from './cal';
import ImageGallery from './imagedisplay';
import ImageAdder from './imageform';
import './styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('events');
  const navigate = useNavigate();
  const handleLogout = () => {
    // Handle logout logic (clear session, redirect, etc.)
    console.log('Logged out');
    navigate('/logout');
    // Example: window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => setCurrentPage('events')} className="dashboard-nav-btn">
          Event Page
        </button>
        <button onClick={() => setCurrentPage('images')} className="dashboard-nav-btn">
          Image Gallery
        </button>
        <button onClick={() => setCurrentPage('imageAdder')} className="dashboard-nav-btn">
          Add Image
        </button>
      </nav>

      <main className="dashboard-main">
        {currentPage === 'events' && <EventPage />}
        {currentPage === 'images' && <ImageGallery />}
        {currentPage === 'imageAdder' && <ImageAdder />}
      </main>
    </div>
  );
};

export default Dashboard;
