import Loader from './Loader';

const PlayerList = ({ playerData }) => {
  return playerData ? (
    <ul>
      {Object.keys(playerData).map((playerId) => {
        const { win, lose, total, winPercent } = playerData[playerId];
        return (
          <li key={playerId}>
            Player ID: {playerId}
            <br />
            Wins: {win}, Losses: {lose}, Total: {total}, Win Percentage: {winPercent}%
          </li>
        );
      })}
    </ul>
  ) : (
    <Loader />
  );
};

export default PlayerList;
