'use client';
import Loader from './Loader';
import axios from 'axios';
import { useState } from 'react';
import VerifyMenu from './VerifyMenu';
import { useRouter } from 'next/router';
import { API_URL } from '@/lib/api';
import { matchModeLabel, normalizeMatchMode } from '@/lib/matchMode';
import MatchModeSelector from './MatchModeSelector';

function VerifyPlayer({ playerName, playerID, matchMode: initialMode = 'ranked' }) {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [matchMode, setMatchMode] = useState(normalizeMatchMode(initialMode));
  const router = useRouter();

  const handleConfirm = () => {
    if (!playerID || !/^\d{1,12}$/.test(String(playerID))) {
      setError('Invalid player ID.');
      return;
    }

    setVerified(true);
    setError('');
    axios
      .post(`${API_URL}/verified`, { id: String(playerID), matchMode })
      .then(() => {
        router.push({
          pathname: '/playerStats/[playerId]',
          query: { playerId: String(playerID), mode: matchMode },
        });
      })
      .catch((err) => {
        setVerified(false);
        const message =
          err.response?.data?.error ||
          err.message ||
          'Analysis failed. Is the backend running?';
        setError(message);
      });
  };

  const handleReject = () => {
    router.back();
  };

  return !verified ? (
    <>
      <VerifyMenu
        playerName={playerName}
        matchModeLabel={matchModeLabel(matchMode)}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />
      <div style={{ maxWidth: '32rem', margin: '1rem auto 0' }}>
        <MatchModeSelector value={matchMode} onChange={setMatchMode} />
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
    </>
  ) : (
    <Loader
      message={`Running ${matchModeLabel(matchMode).toLowerCase()} analysis — typically 3–5 minutes. Please wait…`}
    />
  );
}

export default VerifyPlayer;
