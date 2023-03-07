import { setRevalidateHeaders } from "next/dist/server/send-payload";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import axios from "axios";

const verifyPlayer = (props) => {
  const [data, setData] = useState(null);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    setVerified(true);
    axios.post('/verified')
    .then(res => {
      console.log(res.data)
    })
    .catch(err => {
      console.log(err)
    })
    // fetch("/verified")
    //   .then((res) => res)
    //   .then((data) => setData(data))
    //   .then(console.log(data));
  };

  const handleReject = () => {
    //go home
    fetch("/");
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
        The script is running & will take 3-5 minutes to finish. Please bepatient 🙂
      </h1>
      <div className="centered">
        <Spinner size={large} />
      </div>
    </div>
  );
};

export default verifyPlayer;
