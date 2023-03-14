
const VerifyMenu = (props) => {
  return (
    <div className="verifySection">
      <h1>Is your name {props.playerName}?</h1>
      <button className="vButtonAccept" onClick={props.onConfirm}>
        ✅
      </button>
      <button className="vButtonReject" onClick={props.onReject}>
        ❌
      </button>
    </div>
  );
};
export default VerifyMenu;
