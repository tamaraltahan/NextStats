import Spinner from './Spinner';
import Timer from './Timer';

const Loader = () => {
  return (
    <div className="verifySection">
      <h1 className="TitleText">
        The script is running & will take 3-5 minutes to finish. Please be patient ⏱️
      </h1>
      <Timer />
      <div className="centered">
        <Spinner size="5rem" />
      </div>
    </div>
  );
};

export default Loader;


