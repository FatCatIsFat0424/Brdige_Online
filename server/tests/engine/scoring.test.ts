import { describe, it, expect } from 'vitest';
import { getSeatTeam, calculateGameResult } from '../../src/engine/scoring';
import type { Contract } from '@shared/types';

describe('scoring engine', () => {

  describe('getSeatTeam', () => {
    it('should return EW for East and West', () => {
      expect(getSeatTeam('E')).toBe('EW');
      expect(getSeatTeam('W')).toBe('EW');
    });

    it('should return NS for North and South', () => {
      expect(getSeatTeam('N')).toBe('NS');
      expect(getSeatTeam('S')).toBe('NS');
    });
  });

  describe('calculateGameResult', () => {
    it('should declare NS wins when N is declarer and NS has enough tricks', () => {
      const contract: Contract = { level: 3, suit: 'nt', declarer: 'N' };
      const result = calculateGameResult(contract, 4, 9);
      expect(result.declarerTeamWins).toBe(true);
      expect(result.declarerTeamTricks).toBe(9);
      expect(result.defenderTeamTricks).toBe(4);
      expect(result.requiredTricks).toBe(9); // 6 + 3
    });

    it('should declare EW wins when E is declarer and EW has enough tricks', () => {
      const contract: Contract = { level: 1, suit: 'spades', declarer: 'E' };
      const result = calculateGameResult(contract, 7, 6);
      expect(result.declarerTeamWins).toBe(true);
      expect(result.requiredTricks).toBe(7); // 6 + 1
    });

    it('should declare defenders win when declarer fails', () => {
      const contract: Contract = { level: 7, suit: 'hearts', declarer: 'S' };
      const result = calculateGameResult(contract, 1, 12);
      expect(result.declarerTeamWins).toBe(false);
      expect(result.requiredTricks).toBe(13); // 6 + 7
      expect(result.declarerTeamTricks).toBe(12);
    });

    it('should handle exact boundary (declarer wins with exactly required tricks)', () => {
      const contract: Contract = { level: 4, suit: 'clubs', declarer: 'W' };
      const result = calculateGameResult(contract, 10, 3);
      expect(result.declarerTeamWins).toBe(true);
      expect(result.requiredTricks).toBe(10); // 6 + 4
      expect(result.declarerTeamTricks).toBe(10);
    });

    it('should handle grand slam (7 level)', () => {
      const contract: Contract = { level: 7, suit: 'nt', declarer: 'N' };
      const result = calculateGameResult(contract, 0, 13);
      expect(result.declarerTeamWins).toBe(true);
      expect(result.requiredTricks).toBe(13);
    });
  });
});
