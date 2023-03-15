import React, { useEffect, useState } from 'react';
import Loader from './Loader';

const OutlierList = (playerID, bucket) => {
  const [outlierData, setoutlierData] = useState(null);

  useEffect(() => {
    fetch(`/outliers/${playerID}`)
      .then((response) => response.json())
      .then((data) => setoutlierData(data));
  }, [playerID]);

  if (!outlierData) {
    return <Loader />;
  }

  const outliers = Object.keys(outlierData);

  return (
    <div>
      <h3>{bucket}</h3>
      <ul>
        {outliers.map((playerId) => {
          const { win, lose, total, winPercent } = outlierData[playerId];
          return (
            <li key={playerId}>
              Player ID: {playerId}
              <br />
              Wins: {win}, Losses: {lose}, Total: {total}, Win Percentage: {winPercent}%
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OutlierList;
