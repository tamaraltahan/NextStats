import Spinner from './Spinner';
import Timer from './Timer';

const Loader = ({ message }) => (
  <div className="verifySection">
    {message && <p className="loader-message">{message}</p>}
    {message && <Timer />}
    <Spinner size="3.5rem" />
  </div>
);

export default Loader;
