import React from 'react';
import '../styles/MagicalGuide.css';
import MagicalGuide1 from "./MagicalGuide1";
import MagicalGuide2 from "./MagicalGuide2";
import { useAuth } from '../../auth/hooks/useAuth';


const MagicalGuide = () => {
  const { } = useAuth();

  return (         
      <div className="MagicalGuide-page">
        <MagicalGuide1 />
        <MagicalGuide2 />
      </div>
  );
};

export default MagicalGuide;