export const MATCH_MODES = {
  ranked: {
    id: 'ranked',
    label: 'Ranked only',
    description: 'OpenDota ranked matches (lobby type 7). Best for smurf detection in ranked.',
  },
  all: {
    id: 'all',
    label: 'All queues',
    description: 'Every recent match returned by OpenDota, including Turbo and other modes.',
  },
};

export function normalizeMatchMode(mode) {
  return mode === 'all' ? 'all' : 'ranked';
}

export function matchModeLabel(mode) {
  return MATCH_MODES[normalizeMatchMode(mode)]?.label ?? 'Ranked only';
}
