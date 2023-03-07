import { SyncLoader } from "react-spinners";
import { CircularProgress } from "@mui/material";

const Spinner = ({size}) => {

  return (
    <div className="centered">
      <CircularProgress size={size}/>
    </div>
  );
};

export default Spinner;
