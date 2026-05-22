const VerifyMenu = ({ playerName, matchModeLabel, onConfirm, onReject }) => (
  <div className="verifySection">
    <div className="verify-card card-surface">
      <h1>
        Is this your account?
        <br />
        <span className="verify-card__name">{playerName}</span>
      </h1>
      {matchModeLabel ? (
        <p className="stat-label" style={{ marginBottom: '1rem' }}>
          Analysis mode: <strong>{matchModeLabel}</strong>
        </p>
      ) : null}
      <div className="verify-actions">
        <button type="button" className="btn-verify btn-verify--yes" onClick={onConfirm}>
          Yes, analyze
        </button>
        <button type="button" className="btn-verify btn-verify--no" onClick={onReject}>
          Go back
        </button>
      </div>
    </div>
  </div>
);

export default VerifyMenu;
