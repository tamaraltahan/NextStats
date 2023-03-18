
import Loader from './Loader';

const OutlierList = ({name, outlierData}) => {


  return outlierData ? (
    <div>
      <h3>{name}</h3>
      <ul>
        {Object.keys(outlierData).map((playerId) => {
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
  ) : (
    <Loader />
  );
};

export default OutlierList;
