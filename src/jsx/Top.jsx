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
  }, []);

  const [playerName, setPlayerName] = useState("");

  const handleGetName = (playerName) => {
    setPlayerName(playerName);
  };

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
