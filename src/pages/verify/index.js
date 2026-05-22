'use client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VerifyPlayer from '../../jsx/VerifyPlayer.jsx';
import axios from 'axios';
import Spinner from '../../jsx/Spinner';

export default function VerifyPage() {
  const [profile, setProfile] = useState(null);
  const [fetchState, setFetchState] = useState('idle');
  const { query, isReady } = useRouter();
  const playerId = query.id != null ? String(query.id) : '';
  const matchMode = query.mode === 'all' ? 'all' : 'ranked';
  const validId = /^\d{1,12}$/.test(playerId);

  useEffect(() => {
    if (!isReady || !validId) return;

    axios
      .get(`https://api.opendota.com/api/players/${playerId}`)
      .then((response) => {
        setProfile(response.data);
        setFetchState('ready');
      })
      .catch(() => {
        setFetchState('error');
      });
  }, [isReady, playerId, validId]);

  if (!isReady) {
    return <Spinner />;
  }

  if (!validId) {
    return <p className="error-banner">Enter a valid numeric OpenDota player ID.</p>;
  }

  if (fetchState === 'loading' || fetchState === 'idle') {
    return <Spinner />;
  }

  if (fetchState === 'error') {
    return <p className="error-banner">Player not found. Check the ID on OpenDota and try again.</p>;
  }

  return (
    <div>
      <VerifyPlayer
        playerName={profile?.profile?.personaname ?? 'Unknown'}
        playerID={playerId}
        matchMode={matchMode}
      />
    </div>
  );
}
