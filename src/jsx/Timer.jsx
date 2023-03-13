const { useState, useEffect } = require('react');

const Timer = () => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const interval = 1000;

  useEffect(() => {
    const intervalID = setInterval(() => {
      setSeconds((seconds) => {
        if (seconds === 59) {
          setMinutes((minutes) => minutes + 1);
          return 0;
        } else {
          return seconds + 1;
        }
      });
    }, interval);
    return () => clearInterval(intervalID);
  }, []);

  let textColor;
  if (minutes >= 5) {
    textColor = 'red';
  } else if (minutes >= 3) {
    textColor = 'orange';
  } else {
    textColor = 'green';
  }

  return (
    <div className="timer">
      <h2 style={{ color: textColor }}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </h2>
    </div>
  );
};

export default Timer;
