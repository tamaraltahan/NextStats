'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import MatchModeSelector from './MatchModeSelector';

const Opening = () => {
  const [ID, setID] = useState('');
  const [matchMode, setMatchMode] = useState('ranked');
  const router = useRouter();

  const handleClick = () => {
    if (!ID) return;
    router.push(`/verify?id=${ID}&mode=${matchMode}`);
  };

  return (
    <section className="hero">
      <h1 className="hero__title">Analyze your recent Dota 2 matches</h1>
      <p className="hero__subtitle">
        Enter your{' '}
        <a href="https://www.opendota.com/" target="_blank" rel="noopener noreferrer">
          OpenDota
        </a>{' '}
        player ID to find statistical outliers in your lobby.
      </p>

      <MatchModeSelector value={matchMode} onChange={setMatchMode} />

      <div className="inputContainer">
        <input
          onWheel={(e) => e.target.blur()}
          id="pInput"
          type="number"
          placeholder="OpenDota player ID"
          value={ID}
          onChange={(event) => setID(event.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        />

        <div className="submit-wrap">
          <button className="button-85" onClick={handleClick} type="button">
            Submit
          </button>
        </div>
      </div>
    </section>
  );
};

export default Opening;
