'use client';
import { MATCH_MODES, normalizeMatchMode } from '@/lib/matchMode';

const MatchModeSelector = ({ value, onChange }) => {
  const selected = normalizeMatchMode(value);

  return (
    <div className="match-mode-selector" role="radiogroup" aria-label="Match type">
      {Object.values(MATCH_MODES).map((mode) => (
        <label
          key={mode.id}
          className={`match-mode-option ${selected === mode.id ? 'match-mode-option--active' : ''}`}
        >
          <input
            type="radio"
            name="matchMode"
            value={mode.id}
            checked={selected === mode.id}
            onChange={() => onChange(mode.id)}
          />
          <span className="match-mode-option__label">{mode.label}</span>
          <span className="match-mode-option__desc">{mode.description}</span>
        </label>
      ))}
    </div>
  );
};

export default MatchModeSelector;
