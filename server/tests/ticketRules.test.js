import { describe, expect, it } from 'vitest';
import { canTransition } from '../src/domain/ticket.js';

describe('canTransition', () => {
  it.each([
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
    ['UNKNOWN', 'OPEN'],
  ])('blocks %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });
});
