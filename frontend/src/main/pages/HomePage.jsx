import React from 'react';
import '../styles/HomePage.css';
import Home1 from "./HomePage1.jsx";
import Home2 from "./HomePage2.jsx";
import Home3 from "./HomePage3.jsx";

const HomePage = () => {
  return (
    <div className="homepage-wrapper">      
      <div className="home-page">
        <Home1 />
        <Home2 />
        <Home3 />
      </div>
    </div>
  );
};

export default HomePage;
