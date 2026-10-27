import { canTransition, nextStatuses } from './constants.js';

describe('status transitions', () => {
  it.each([ // allowed transitions
    ['OPEN', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'RESOLVED'],
    ['IN_PROGRESS', 'OPEN'],
    ['RESOLVED', 'OPEN'],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    ['OPEN', 'RESOLVED'],
    ['RESOLVED', 'IN_PROGRESS'],
    ['OPEN', 'OPEN'],
    ['UNKNOWN', 'OPEN'],
  ])('blocks %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it('returns no moves for an unknown status', () => {
    expect(nextStatuses('UNKNOWN')).toEqual([]);
  });
});
