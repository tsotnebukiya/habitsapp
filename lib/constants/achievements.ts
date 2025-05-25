import { Achievement, StreakDays } from '../habit-store/types';

export const ACHIEVEMENTS: Record<StreakDays, Achievement> = {
  1: {
    id: 1,
    name: 'First Step',
    days: 1,
  },
  3: {
    id: 3,
    name: 'Getting Started',
    days: 3,
  },
  5: {
    id: 5,
    name: 'Work Week Winner',
    days: 5,
  },
  7: {
    id: 7,
    name: 'Week Warrior',
    days: 7,
  },
  10: {
    id: 10,
    name: 'Double Digits',
    days: 10,
  },
  14: {
    id: 14,
    name: 'Fortnight Focus',
    days: 14,
  },
  21: {
    id: 21,
    name: 'Habit Forming',
    days: 21,
  },
  28: {
    id: 28,
    name: 'Four Week Warrior',
    days: 28,
  },
  30: {
    id: 30,
    name: 'Monthly Master',
    days: 30,
  },
  45: {
    id: 45,
    name: 'Six Week Superstar',
    days: 45,
  },
  60: {
    id: 60,
    name: 'Bi-Monthly Beast',
    days: 60,
  },
  90: {
    id: 90,
    name: 'Quarterly Champion',
    days: 90,
  },
  100: {
    id: 100,
    name: 'Century Crusher',
    days: 100,
  },
  180: {
    id: 180,
    name: 'Half-Year Hero',
    days: 180,
  },
  200: {
    id: 200,
    name: 'Bicentennial Boss',
    days: 200,
  },
};
