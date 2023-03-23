"use client"
import PlayerList from '../../jsx/PlayerList';
import OutlierList from '@/jsx/OutlierList';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';


const StatsScreen = () => {
  const [playerId, setPlayerID] = useState('');
  const [data, setData] = useState(null);

  const router = useRouter();
  useEffect(() => {
    setPlayerID(router.query.playerId);
  }, [router.query]);

  useEffect(() => {
    if (playerId) {
      const fetchData = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/playerData?id=${playerId}`);
          setData(res.data);
        } catch (e) {
          console.log(e);
        }
      };
      fetchData();
    }
  }, [playerId]);

  if (!playerId || !data) return null;
  return (
    <div>
      <div className="statsBanner">
        <p>
          The mean total games played is:&nbsp;&nbsp; {data.Statistics.meanTotal} games
          <br />
          The mean win percent of players is:&nbsp;&nbsp; {data.Statistics.meanWins}% winrate
        </p>
        <br />
        <p>
          Suspect players will have a deviation of {data.outliers.totalGamesThreshold} games, and{' '}
          {data.outliers.winPercentThreshold}% winrate from the mean
        </p>
      </div>

      <div className="">
        <p style={{ marginTop: '25px', fontSize: 'large', textAlign: 'center' }}>
          List of all available players & their stats:
        </p>
        <PlayerList playerData={data.playerData} />
      </div>

      <div className="statsGrid">
        <OutlierList
          outlierData={data.outliers.outlierWinsPositive}
          name="Positive Winrate"
          className="outliers"
        />
        <OutlierList
          outlierData={data.outliers.outlierTotalsPositive}
          name="Positive Total Games"
        />
        <OutlierList
          outlierData={data.outliers.outliersWinsNegative}
          name="Negative Winrate"
          className="outliers"
        />
        <OutlierList
          outlierData={data.outliers.outliersTotalNegative}
          name="Negative Total Games"
        />
        <OutlierList
          outlierData={data.outliers.highWinLowGames}
          name="High Winrate, Low Total Games"
        />
        <OutlierList
          outlierData={data.outliers.lowWinLowGames}
          name="Low Winrate, Low Total Games"
        />
      </div>
    </div>
  );
};

export default StatsScreen;
