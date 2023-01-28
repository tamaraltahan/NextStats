import { useState } from "react";

const verifyPlayer = (props) => {

    const [verified, setVerified] = useState(false)

    // const handleConfirm = () => {

    // }

    // const handleReject = () => {

    // }

    return(
        <div>
            <h2>Is your name {props.playerName}</h2>
            <button className="confirmButton">✅</button>
            <button className="rejectButton">❌</button>
        </div>
    )


}

export default verifyPlayer;
