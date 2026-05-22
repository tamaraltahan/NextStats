import { ClipLoader } from 'react-spinners';

const Spinner = ({ size = 48 }) => (
  <div className="centered">
    <ClipLoader color="#8b5cf6" size={size} aria-label="Loading" />
  </div>
);

export default Spinner;
