import { useState } from 'react';
import Spinner from './Spinner';
import axios from 'axios';
import Timer from './Timer';

const verifyPlayer = (props) => {
  const [verified, setVerified] = useState(false);

  const handleConfirm = () => {
    setVerified(true);
    axios
      .post('http://localhost:3001/verified', { id: props.playerID })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log('Error', err.message);
        }
        console.log(err.config);
      });
  };

  const handleReject = () => {
    console.log('not done yet 😄');
  };

  return !verified ? (
    <div className="verifySection">
      <h1>Is your name {props.playerName}?</h1>
      <button className="vButtonAccept" onClick={handleConfirm}>
        ✅
      </button>
      <button className="vButtonReject" onClick={handleReject}>
        ❌
      </button>
    </div>
  ) : (
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

export default verifyPlayer;
