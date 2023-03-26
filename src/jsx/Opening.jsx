'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Opening = (props) => {
  const [ID, setID] = useState('');
  const router = useRouter();

  const handleClick = () => {
    router.push(`/verify?id=${ID}`);
  };

  return (
    <div>
      <h1 id="topBanner">
        Enter your{' '}
        <a href="https://www.opendota.com/" target="_blank" rel="noopener noreferrer">
          OpenDota
        </a>{' '}
        user ID
      </h1>

      <div className="inputContainer">
        <input
          onWheel={(e) => e.target.blur()}
          id="pInput"
          type="number"
          onChange={(event) => setID(event.target.value)}
        />

        <button className="button-85" onClick={handleClick} placeholder="OpenDota ID" type="submit">
          Submit
        </button>
        <br />
      </div>
    </div>
  );
};

export default Opening;
