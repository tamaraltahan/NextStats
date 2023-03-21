import Loader from './Loader';

const OutlierList = ({ name, outlierData }) => {
  return outlierData ? (
    <div>
      <h3>{name}</h3>
      <ul>
        {Object.keys(outlierData).map((playerId) => {
          const { win, lose, total, winPercent } = outlierData[playerId];
          return (
            <li key={playerId} className="list">
              Player ID: {playerId}
              <br />
              <span style={{ color: '#1bb21b' }}>Wins: </span>
              {win}, <span style={{ color: 'red' }}>Losses: </span> {lose},{' '}
              <span style={{ color: '#00BFFF' }}>Total:</span> {total},{' '}
              <span style={{ color: '#E4D00A' }}>Win Percentage:</span> {winPercent}%
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <Loader />
  );
};

export default OutlierList;
