'use client';
import MasterPlayerTable from '../../jsx/MasterPlayerTable';
import TopSuspects from '@/jsx/TopSuspects';
import StatsSummary from '@/jsx/StatsSummary';
import TierLegend from '@/jsx/TierLegend';
import ClassificationOverview from '@/jsx/ClassificationOverview';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { API_URL } from '@/lib/api';
import Loader from '../../jsx/Loader';
import MyPiePlot from '../../jsx/PiePlot';
import MyScatterPlot from '../../jsx/ScatterPlot';
import { buildScatterPoints } from '@/lib/playerData';
import { normalizeAnalysis } from '@/lib/analysis';
import { matchModeLabel, normalizeMatchMode } from '@/lib/matchMode';
import GlobalPoolCard from '@/jsx/GlobalPoolCard';
import MatchModeSelector from '@/jsx/MatchModeSelector';

const StatsScreen = () => {
  const [data, setData] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const matchMode = normalizeMatchMode(router.query.mode);
  const playerId =
    router.isReady && router.query.playerId != null ? String(router.query.playerId) : '';

  useEffect(() => {
    if (!router.isReady || !playerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/playerData`, {
          params: { id: playerId, mode: matchMode },
        });
        setData(res.data);
      } catch (e) {
        setData(null);
        setError(
          e.response?.data?.error ||
            'Could not load analysis. Run verification first or wait for the script to finish.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router.isReady, playerId, matchMode]);

  useEffect(() => {
    if (!router.isReady || !playerId) return;
    axios
      .get(`https://api.opendota.com/api/players/${playerId}`)
      .then((res) => setUserName(res.data?.profile?.personaname ?? 'Player'))
      .catch(() => setUserName('Player'));
  }, [router.isReady, playerId]);

  const analysis = useMemo(() => (data ? normalizeAnalysis(data) : null), [data]);

  const scatterPoints = useMemo(
    () => (analysis ? buildScatterPoints(analysis.players) : []),
    [analysis]
  );

  if (!router.isReady || !playerId) return <Loader message="Loading…" />;
  if (loading) return <Loader message="Loading player analysis…" />;
  if (error) return <p className="error-banner">{error}</p>;
  if (!data || !analysis) return null;

  const tierCounts = analysis.tierCounts || {};
  const flaggedCount = analysis.flaggedPlayerIds?.length ?? 0;
  const typicalCount = tierCounts.typical ?? 0;

  return (
    <div className="stats-page">
      <div className="stats-hero">
        <h1>
          Match analysis for <span className="stats-hero__name">{userName}</span>
        </h1>
        <p className="hero__subtitle" style={{ marginTop: '0.5rem' }}>
          <span className="mode-pill">{matchModeLabel(matchMode)}</span>
          {' · '}
          {data.analyzedPlayers?.matches ?? '—'} matches · {analysis.players.length} players ·{' '}
          {flaggedCount} flagged
        </p>
        <div className="stats-mode-switch">
          <MatchModeSelector
            value={matchMode}
            onChange={(mode) =>
              router.push({
                pathname: '/playerStats/[playerId]',
                query: { playerId, mode },
              })
            }
          />
          <p className="stat-label">
            Switching modes shows a separate saved analysis. Run verification again if this mode
            has not been analyzed yet.
          </p>
        </div>
      </div>

      <GlobalPoolCard pool={data.globalPool} />

      <StatsSummary
        statistics={data.Statistics}
        analysis={{ ...analysis, matches: data.analyzedPlayers?.matches }}
        matchMode={matchMode}
      />

      <TierLegend tierCounts={tierCounts} />

      <h2 className="section-title">Top suspects</h2>
      <div className="top-suspects-panel card-surface">
        <TopSuspects suspects={analysis.topSuspects} />
      </div>

      <h2 className="section-title">All parsed players</h2>
      <div className="player-table-panel card-surface">
        <MasterPlayerTable players={analysis.players} />
      </div>

      <h2 className="section-title">Classification breakdown</h2>
      <div className="card-surface" style={{ padding: '1.25rem' }}>
        <ClassificationOverview
          classificationCounts={analysis.classificationCounts}
          methodology={analysis.methodology}
        />
      </div>

      <div className="charts-row">
        <div className="chart-wrap">
          <MyPiePlot
            title="Public vs anonymous"
            axes1={data.analyzedPlayers.countPlayers}
            axes2={data.analyzedPlayers.countPossible - data.analyzedPlayers.countPlayers}
            label1="Public"
            label2="Anonymous"
          />
        </div>
        <div className="chart-wrap">
          <MyPiePlot
            title="Flagged vs typical"
            axes1={flaggedCount}
            axes2={typicalCount}
            label1="Flagged"
            label2="Typical"
          />
        </div>
      </div>

      <div className="chart-wrap centered" style={{ margin: '0 auto', maxWidth: '100%' }}>
        <MyScatterPlot title="Win rate vs total games (by tier)" points={scatterPoints} />
      </div>
    </div>
  );
};

export default StatsScreen;
