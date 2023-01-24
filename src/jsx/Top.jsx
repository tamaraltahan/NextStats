import { useState } from "react";

//TODO:
//how to pass props using es6?
//Can data be passed through react modules without any component dependancies
//as in, how can I call a script x.js to get me my json obj to use as a prop in this file

const Top = () => {
  const [ID, setID] = useState("");

  // this will be for tracking completion on each stage since my scripts takes a million years
  const [status, setStatus] = useState("")

  const handleClick = () => ID;

  return (
    <div>
      <h1 id="topBanner">
        Enter your{" "}
        <a
          href="https://www.opendota.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenDota
        </a>{" "}
        user ID
      </h1>

      <input id="pInput" type="text" onChange={(event) => setID(event.target.value)} />

      <button id="submitButton" onClick={handleClick} placeholder="OpenDota ID" type="submit">
        Submit
      </button>

      <div>
        <h2>Your ID is: {ID}</h2>
      </div>
    </div>
  );
};

export default Top;
