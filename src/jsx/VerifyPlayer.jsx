import { useEffect, useState } from "react";

const verifyPlayer = (props) => {

    const [verified, setVerified] = useState(false)
    const [rejected, setRejected] = useState(false)

    const handleConfirm = () => {
        setVerified(true)
    }

    const handleReject = () => {
        setRejected(true)
    }

    return(
        <div className="verifySection">
            <h1>Is your name {props.playerName}?</h1>
            <button className="vButtonAccept" onClick={handleConfirm}>✅</button>
            <button className="vButtonReject" onClick={handleReject}>❌</button>
        </div>
    )

}

export default verifyPlayer;
