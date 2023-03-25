'use client';
import PlayerList from '../../jsx/PlayerList';
import OutlierList from '@/jsx/OutlierList';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Spacer, Card, Text, Container } from '@nextui-org/react';
import MyPlot from '@/jsx/PiePlot';

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
          // console.log(e);
        }
      };
      fetchData();
    }
  }, [playerId]);
  if (!playerId || !data) return null;
  return (
    <div>
      <div className="statsBanner">
        <Container>
          <Card
            className="centered"
            css={{ mw: '800px', paddingLeft: '50px', paddingRight: '50px' }}
          >
            <Text>
              The mean total games played is:&nbsp;&nbsp; {data.Statistics.meanTotal} games
              <br />
              The mean win percent of players is:&nbsp;&nbsp; {data.Statistics.meanWins}% winrate
            </Text>
            <br />
            <Text>
              Filtered players will have a deviation of {data.outliers.totalGamesThreshold} games,
              and {data.outliers.winPercentThreshold}% winrate from the mean
            </Text>
            <Spacer />
            <Text>
              Filtered players will have a winrate less than{' '}
              <span style={{ fontWeight: 'bold' }}>
                {data.Statistics.meanWins - data.outliers.winPercentThreshold}%
              </span>{' '}
              or greater than{' '}
              <span style={{ fontWeight: 'bold' }}>
                {Math.round(data.Statistics.meanWins + data.outliers.winPercentThreshold).toFixed(
                  2
                )}
                %
              </span>
              <br />
              and a total game count of less than{' '}
              <span style={{ fontWeight: 'bold' }}>
                {Math.round(data.Statistics.meanTotal - data.outliers.totalGamesThreshold) + 1}{' '}
              </span>{' '}
              or greater than{' '}
              <span style={{ fontWeight: 'bold' }}>
                {Math.round(data.Statistics.meanTotal + data.outliers.totalGamesThreshold) + 1}
              </span>
            </Text>
          </Card>
        </Container>
      </div>

      <div>
        <p style={{ marginTop: '25px', fontSize: 'large', textAlign: 'center' }}>
          List of all available players & their stats:
        </p>
        <Container css={{ maxWidth: '90%' }}>
          <PlayerList playerData={data.playerData} />
        </Container>
      </div>
      <Spacer />

      <div className="statsBanner">
        <Container>
          <Card
            className="centered"
            css={{ mw: '800px', padding:'15px'}}
          >
            <Text>
              Lists of players filtered as outliers
            </Text>
          </Card>
        </Container>
      </div>
      <Spacer />

      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <Card css={{ mw: '80%' }}>
          <Card.Body>
            {/* map outlier lists */}
            <div className="grid-container" style={{ gap: '50px' }}>
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
          </Card.Body>
        </Card>
      </div>
        <MyPlot />
    </div>
  );
};

export default StatsScreen;
