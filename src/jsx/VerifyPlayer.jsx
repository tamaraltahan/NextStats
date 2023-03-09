import { setRevalidateHeaders } from "next/dist/server/send-payload";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";

const verifyPlayer = (props) => {
  const [data, setData] = useState(null);
  const [verified, setVerified] = useState(false);

  const handleConfirm = () => {
    setVerified(true);
    axios.post(`http://localhost:3001/verified`, {id: props.playerID})
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          // The request was made but no response was received
          console.log(err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', err.message);
        }
        console.log(err.config);
      });
  };
  

  const handleReject = () => {
    console.log("not done yet 😄")
  };

  return { verified } ? (
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
      <h1>
        The script is running & will take 3-5 minutes to finish. Please be patient ⏱️
      </h1>
      <div className="centered">
        <Spinner size={large} />
      </div>
    </div>
  );
};

export default verifyPlayer;
