import Loader from './Loader';

const PlayerList = ({ playerData }) => {
  return playerData ? (
    <ul>
      {Object.keys(playerData).map((playerId) => {
        const { win, lose, total, winPercent } = playerData[playerId];
        return (
          <li key={playerId} className="list">
            Player ID: <span style={{marginBottom: "10px", display: "inline-block", fontWeight:"bold"}}>{playerId}</span>
            <br />
            <span style={{ color: '#1bb21b' }}>Wins: </span>
            {win}, <span style={{ color: 'red' }}>Losses: </span> {lose},{' '}
            <span style={{ color: '#00BFFF' }}>Total:</span> {total},{' '}
            <span style={{ color: '#E4D00A' }}>Win Percentage:</span> {winPercent}%
          </li>
        );
      })}
    </ul>
  ) : (
    <Loader />
  );
};

export default PlayerList;
