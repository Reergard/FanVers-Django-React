import React from 'react';
import '../styles/HomePage.css';
import Home1 from "./HomePage1";
import Home2 from "./HomePage2";
import Home3 from "./HomePage3";
import { useAuth } from '../../auth/hooks/useAuth';


const HomePage = () => {
  const { userInfo, isAuthenticated, user } = useAuth();

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