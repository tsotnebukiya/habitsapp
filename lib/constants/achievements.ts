import { Achievement } from '../../habits-store/types';
import { StreakDays } from '../../habits-store/types';

export const ACHIEVEMENTS: Record<StreakDays, Achievement> = {
  1: {
    id: 1,
    name: 'First Step',
    description: 'Complete your first day streak',
    icon: '🌱',
    days: 1,
  },
  3: {
    id: 3,
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🌿',
    days: 3,
  },
  7: {
    id: 7,
    name: 'Week Warrior',
    description: 'Complete a full week streak',
    icon: '🌳',
    days: 7,
  },
  10: {
    id: 10,
    name: 'Double Digits',
    description: 'Reach a 10-day streak',
    icon: '🌲',
    days: 10,
  },
  14: {
    id: 14,
    name: 'Fortnight Focus',
    description: 'Maintain a two-week streak',
    icon: '🎯',
    days: 14,
  },
  21: {
    id: 21,
    name: 'Habit Forming',
    description: 'Keep a 21-day streak',
    icon: '⭐',
    days: 21,
  },
  28: {
    id: 28,
    name: 'Four Week Warrior',
    description: 'Complete a four-week streak',
    icon: '🌟',
    days: 28,
  },
  30: {
    id: 30,
    name: 'Monthly Master',
    description: 'Maintain a full month streak',
    icon: '🏆',
    days: 30,
  },
  60: {
    id: 60,
    name: 'Bi-Monthly Beast',
    description: 'Keep a two-month streak going',
    icon: '👑',
    days: 60,
  },
  90: {
    id: 90,
    name: 'Quarterly Champion',
    description: 'Maintain a three-month streak',
    icon: '💫',
    days: 90,
  },
  180: {
    id: 180,
    name: 'Half-Year Hero',
    description: 'Keep a six-month streak',
    icon: '🌠',
    days: 180,
  },
  365: {
    id: 365,
    name: 'Year of Excellence',
    description: 'Complete a full year streak',
    icon: '🎊',
    days: 365,
  },
};
