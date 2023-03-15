import PlayerList from "./PlayerList";
import OutlierList from "@/jsx/OutlierList";
import { useEffect } from "react";

const StatsScreen = (props) => {

    useEffect(() => {
        fetch(`/players/${playerID}`)
          .then((response) => response.json())
          .then((data) => setPlayerData(data));
      });

    const {playerID} = props;
    return (
        <div>
            <p></p>
            <PlayerList />
            <OutlierList playerID={playerID} bucket="outlierWinsPositive"/>
            <OutlierList playerID={playerID} bucket="outlierTotalsPositive"/>
            <OutlierList playerID={playerID} bucket="outliersWinsNegative"/>
            <OutlierList playerID={playerID} bucket="outliersTotalNegative"/>
            <OutlierList playerID={playerID} bucket="highWinLowGames"/>
            <OutlierList playerID={playerID} bucket="lowWinLowGames"/>
        </div>
    )
}

export default StatsScreen;