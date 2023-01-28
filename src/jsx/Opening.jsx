import { useState } from "react";
import axios from "axios";

const Opening = (props) => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  const [ID, setID] = useState("");

  const handleClick = () => {

    const playerLink = `https://api.opendota.com/api/players/${ID}`;

    axios
      .get(playerLink)
      .then((response) => {
        setPost(response.data);
        props.getName(response.data.profile.personaname)
        console.log(response);
      })
      .catch((error) => {
        setError(error);
      });
    if (error) return `Error: ${error.message}`;
    if (!post) return "Failed to get POST";
  };

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

      <div className="inputContainer">
        <input
          id="pInput"
          type="text"
          onChange={(event) => setID(event.target.value)}
        />

        <button
          className="button-85"
          onClick={handleClick}
          placeholder="OpenDota ID"
          type="submit"
        >
          Submit
        </button>
        <br />
      </div>
    </div>
  );
};

export default Opening;
