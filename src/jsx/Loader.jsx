import Spinner from './Spinner';
import Timer from './Timer';

const Loader = ({ message }) => {
  return (
    <div className="verifySection">
      {message && (
        <>
          <h1 className="TitleText">{message}</h1>
          <Timer />
        </>
      )}
      <div className="centered">
        <Spinner size="5rem" />
      </div>
    </div>
  );
};

export default Loader;
