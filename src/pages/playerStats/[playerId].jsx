'use client';
import PlayerList from '../../jsx/PlayerList';
import OutlierList from '@/jsx/OutlierList';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Spacer, Card, Text, Container, Grid } from '@nextui-org/react';
import MyPiePlot from '../../jsx/PiePlot';
import MyScatterPlot from '../../jsx/ScatterPlot';

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
            css={{ mw: '900px', paddingLeft: '50px', paddingRight: '50px' }}
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
                {(data.Statistics.meanWins - data.outliers.winPercentThreshold).toFixed(2)}%
              </span>{' '}
              or greater than{' '}
              <span style={{ fontWeight: 'bold' }}>
                {(data.Statistics.meanWins + data.outliers.winPercentThreshold).toFixed(2)}%
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

            <Spacer />
            <Text css={{ textAlign: 'center' }}>
              <Text color='warning' weight='extrabold'>
                Disclaimer:
              </Text>
              Since the standard deviation of total games is very high, outliers for total games
              will be outside of <span style={{ fontWeight: 'bold' }}>1</span> stdev, while the win
              rate is at 1.5 stdevs
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
          <Card className="centered" css={{ mw: '800px', padding: '15px' }}>
            <Text>Lists of players filtered as outliers</Text>
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

      <Grid.Container gap={2} justify="center">
        <Grid>
          <MyPiePlot
            title="Anonymous Profiles"
            axes1={data.analyzedPlayers.countPlayers}
            axes2={data.analyzedPlayers.countPossible}
            label1="Public"
            label2="Anonymous"
          />
        </Grid>

        <MyPiePlot
          title="Outliers to Normal Players"
          axes1={data.analyzedPlayers.countOutliers}
          axes2={data.analyzedPlayers.countPlayers}
          label1="Outliers"
          label2="Normal"
        />
      </Grid.Container>
      <div className="centered">
        <MyScatterPlot title="Total Games to Win Percent" x={data.totals} y={data.winPercents} />
      </div>
    </div>
  );
};

export default StatsScreen;

/*

          const piData1 = {
            "title" : "Anonymous Profiles",
            "axes": {
              "a": res.data.analyzedPlayers.countPlayers,
              "b": res.datadata.analyzedPlayers.countPossible,
            },
            "labels":{
              'a': 'Public',
              'b': 'Anonymous'
            } 
          }
        
          const piData2 = {
            "title" : "Outliers to Normal Profiles",
            "axes": {
              "a": res.data.analyzedPlayers.countPlayers,
              "b": res.data.analyzedPlayers.countOutliers,
            },
            "labels":{
              'a': 'Normal',
              'b': 'Outlier'
            } 
          }
*/
