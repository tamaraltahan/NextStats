import { useState, useEffect } from "react";
import axios from "axios";

import Opening from "../jsx/Opening";
import VerifyPlayer from "./VerifyPlayer.jsx";

//my player id:
// 1986753

const Top = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/`);
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    };
    const response = fetchData();
    console.log(response);
  }, []);

  const [playerName, setPlayerName] = useState("");

  const handleGetName = (playerName) => {
    console.log(playerName);
    setPlayerName(playerName);
  };

  // this will be for tracking completion on each stage since my scripts takes a million years
  const [status, setStatus] = useState("");
  const [hasName, setHasName] = useState(false);

  return (
    <div>
      {!playerName ? (
        <Opening getName={handleGetName} />
      ) : (
        <VerifyPlayer playerName={playerName} />
      )}
    </div>
  );
};

export default Top;
