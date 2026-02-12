import { useEffect, useState } from 'react';
import '../styles/Snowfall.css';

const Snowfall = ({ snowflakeCount = 50 }) => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = [];
    for (let i = 0; i < snowflakeCount; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        fontSize: 10 + Math.random() * 10,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    setSnowflakes(flakes);
  }, [snowflakeCount]);

  return (
    <div className="snowfall-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.fontSize}px`,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowfall;
