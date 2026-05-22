'use client';
import { useMemo, useState } from 'react';
import TierBadge from './TierBadge';

const COLUMNS = [
  { key: 'userName', label: 'Player', sortable: true },
  { key: 'id', label: 'ID', sortable: true },
  { key: 'rankLabel', label: 'Rank', sortable: true },
  { key: 'total', label: 'Games', sortable: true },
  { key: 'winPercent', label: 'Win %', sortable: true },
  { key: 'suspicionScore', label: 'Score', sortable: true },
  { key: 'tier', label: 'Tier', sortable: true },
  { key: 'classificationLabels', label: 'Flags', sortable: false },
];

function compareValues(a, b, key) {
  const first = a[key];
  const second = b[key];
  if (key === 'classificationLabels') {
    return String((first || []).join(',')).localeCompare(String((second || []).join(',')));
  }
  if (typeof first === 'number' && typeof second === 'number') return first - second;
  return String(first ?? '').localeCompare(String(second ?? ''), undefined, { numeric: true });
}

const MasterPlayerTable = ({ players = [] }) => {
  const [sort, setSort] = useState({ column: 'suspicionScore', direction: 'descending' });

  const sorted = useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      let cmp = compareValues(a, b, sort.column);
      if (sort.direction === 'descending') cmp *= -1;
      return cmp;
    });
    return copy;
  }, [players, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.column === key
        ? { column: key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { column: key, direction: 'ascending' }
    );
  };

  return (
    <div className="player-table-scroll" role="region" aria-label="All analyzed players">
      <table className="master-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>
                {col.sortable ? (
                  <button
                    type="button"
                    className="master-table__sort"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort.column === col.key ? (sort.direction === 'ascending' ? ' ↑' : ' ↓') : ''}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id}>
              <td>{item.userName || '—'}</td>
              <td>
                <a
                  className="external-link"
                  href={`https://www.opendota.com/players/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.id}
                </a>
              </td>
              <td>{item.rankLabel || '—'}</td>
              <td>{item.total?.toLocaleString()}</td>
              <td>{item.winPercent}%</td>
              <td>{item.suspicionScore}</td>
              <td>
                <TierBadge tier={item.tier} />
              </td>
              <td>
                <div className="flag-chips">
                  {(item.classificationLabels || []).length
                    ? item.classificationLabels.map((label) => (
                        <span key={label} className="flag-chip">
                          {label}
                        </span>
                      ))
                    : '—'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterPlayerTable;
