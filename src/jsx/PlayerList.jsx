import React, { useEffect, useState } from 'react';

const PlayerList = (playerID) => {
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    fetch(`/players/${playerID}`)
      .then((response) => response.json())
      .then((data) => setPlayerData(data));
  }, [playerID]);

  if (!playerData) {
    return <div>Loading...</div>;
  }

  const players = Object.keys(playerData);

  return (
    <ul>
      {players.map((playerId) => {
        const { win, lose, total, winPercent } = playerData[playerId];
        return (
          <li key={playerId}>
            Player ID: {playerId}
            <br />
            Wins: {win}
            <br />
            Losses: {lose}
            <br />
            Total: {total}
            <br />
            Win Percentage: {winPercent}%
          </li>
        );
      })}
    </ul>
  );
};

export default PlayerList;
