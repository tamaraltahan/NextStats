import { setRevalidateHeaders } from "next/dist/server/send-payload";
import { useEffect, useState } from "react";

const verifyPlayer = (props) => {
  const [data, setData] = useState(null);
  const [verified, setVerified] = useState(false);
  
  const handleConfirm = () => {
    setVerified(true);
    fetch("/verified")
      .then((res) => res)
      .then((data) => setData(data))
      .then(console.log(data))
    };

  const handleReject = () => {
    //go home
    fetch('/')
  };

  return (
    <div className="verifySection">
      <h1>Is your name {props.playerName}?</h1>
      <button className="vButtonAccept" onClick={handleConfirm}>
        ✅
      </button>
      <button className="vButtonReject" onClick={handleReject}>
        ❌
      </button>
    </div>
  );
};

export default verifyPlayer;
