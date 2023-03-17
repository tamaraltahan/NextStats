import PlayerList from '../../jsx/PlayerList';
import OutlierList from '@/jsx/OutlierList';
import { useEffect, useState } from 'react';
// import axios from 'axios';

const StatsScreen = (playerId) => {
  const [playerID, setPlayerID] = useState('');
  const [stats, setStats] = useState(null);
  const [winPercentThreshold, setWinpercentThreshold] = useState(0);
  const [totalGamesThreshold, setTotalGamesThreshold] = useState(0);
  const [meanWins, setMeanWins] = useState(0);
  const [meanTotalGames, setMeanTotalGames] = useState(0);

  useEffect(() => {
    fetch(`/outliers/${playerID}`)
      .then((response) => response.json())
      .then((data) => {
        setPlayerID(playerID);
        console.log(data);
      })
      .then(() => {
        fetch(`/stats/${playerID}`)
          .then((response) => response.json())
          .then((data) => setStats(data))
          .then(() => setStatData());
      });
  }, [playerID]);
  

  const setStatData = () => {
    setWinpercentThreshold(stats.winPercentThreshold);
    setTotalGamesThreshold(stats.winPercentThreshold);
    setMeanWins(stats.meanWins);
    setMeanTotalGames(stats.meanTotalGames);
  };



  return (
    <div>
      <div>
        <p>
          With a mean of {meanTotalGames} games, & {meanWins}% winrate
        </p>
        <br />
        <p>
          Suspect players will have a deviation of {totalGamesThreshold} games, and{' '}
          {winPercentThreshold}% winrate from the mean
        </p>
      </div>

      <PlayerList />
      <div>
        <OutlierList playerID={playerID} bucket="outlierWinsPositive" name="Positive Winrate" />
        <OutlierList
          playerID={playerID}
          bucket="outlierTotalsPositive"
          name="Positive Total Games"
        />
        <OutlierList playerID={playerID} bucket="outliersWinsNegative" name="Negative Winrate" />
        <OutlierList
          playerID={playerID}
          bucket="outliersTotalNegative"
          name="Negative Total Games"
        />
        <OutlierList
          playerID={playerID}
          bucket="highWinLowGames"
          name="High Winrate & Low Total Games"
        />
        <OutlierList
          playerID={playerID}
          bucket="lowWinLowGames"
          name="Low Winrate & Low Total Games"
        />
      </div>
    </div>
  );
};

export default StatsScreen;

/*
Want to request the ID to query the backend correctly
then need to get the json data of outliers to pass to each component for display
also need to call backend for stats data to display on this screen
when stats is returned we can set all the current stateful variables



*/
