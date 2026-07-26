import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck } from '../../src/engine/deck';

describe('deck engine', () => {

  describe('createDeck', () => {
    it('should create a deck of 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have 13 cards per suit', () => {
      const deck = createDeck();
      const suits = ['spades', 'hearts', 'clubs', 'diamonds'] as const;
      for (const suit of suits) {
        const suitCards = deck.filter((c) => c.suit === suit);
        expect(suitCards).toHaveLength(13);
      }
    });

    it('should have all ranks for each suit', () => {
      const deck = createDeck();
      const spades = deck.filter((c) => c.suit === 'spades');
      const ranks = spades.map((c) => c.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    });

    it('should have no duplicate cards', () => {
      const deck = createDeck();
      const unique = new Set(deck.map((c) => `${c.suit}-${c.rank}`));
      expect(unique.size).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck of the same length', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('should not modify the original deck', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck);
      expect(deck).toEqual(original);
    });

    it('should contain the same cards as the original', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const originalSet = new Set(deck.map((c) => `${c.suit}-${c.rank}`));
      const shuffledSet = new Set(shuffled.map((c) => `${c.suit}-${c.rank}`));
      expect(shuffledSet).toEqual(originalSet);
    });

    it('should produce different order with different random seed', () => {
      const deck = createDeck();
      let seed = 42;
      const seededRandom = (): number => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const shuffled1 = shuffleDeck(deck, seededRandom);

      seed = 99;
      const shuffled2 = shuffleDeck(deck, seededRandom);

      // 極低機率兩次完全相同
      const same = shuffled1.every(
        (c, i) => c.suit === shuffled2[i].suit && c.rank === shuffled2[i].rank,
      );
      expect(same).toBe(false);
    });

    it('should produce deterministic output with same seed', () => {
      const deck = createDeck();
      const createSeeded = (): (() => number) => {
        let s = 42;
        return (): number => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      };

      const shuffled1 = shuffleDeck(deck, createSeeded());
      const shuffled2 = shuffleDeck(deck, createSeeded());

      expect(shuffled1).toEqual(shuffled2);
    });
  });
});
