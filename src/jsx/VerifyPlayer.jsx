import Loader from './Loader';
import axios from 'axios';
import { useState } from 'react';
import VerifyMenu from './VerifyMenu';
import { useRouter } from 'next/router';

function VerifyPlayer(props) {
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    setVerified(true);
    axios
      .post('http://localhost:3001/verified', { id: props.playerID })
      .then((res) => {
        console.log('routing to playerStats')
        router.push({pathname: `/playerStats?id=${props.playerID}`, query: {res}});
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
    <VerifyMenu playerName={props.playerName} onConfirm={handleConfirm} onReject={handleReject} />
  ) : (
    <Loader />
  );
}

export default VerifyPlayer;
