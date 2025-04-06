export type MeasurementCategory =
  | 'count'
  | 'time'
  | 'distance'
  | 'volume'
  | 'weight';

export interface MeasurementUnit {
  id: string;
  name: string;
  shortName: string;
  category: MeasurementCategory;
  baseIncrement: number;
  defaultGoal: number;
}

export const MeasurementUnits: Record<string, MeasurementUnit> = {
  count: {
    id: 'count',
    name: 'Times',
    shortName: 'x',
    category: 'count',
    baseIncrement: 1,
    defaultGoal: 1,
  },
  minutes: {
    id: 'minutes',
    name: 'Minutes',
    shortName: 'min',
    category: 'time',
    baseIncrement: 5,
    defaultGoal: 30,
  },
  hours: {
    id: 'hours',
    name: 'Hours',
    shortName: 'h',
    category: 'time',
    baseIncrement: 0.5,
    defaultGoal: 1,
  },
  kilometers: {
    id: 'kilometers',
    name: 'Kilometers',
    shortName: 'km',
    category: 'distance',
    baseIncrement: 0.5,
    defaultGoal: 5,
  },
  liters: {
    id: 'liters',
    name: 'Liters',
    shortName: 'L',
    category: 'volume',
    baseIncrement: 0.25,
    defaultGoal: 2,
  },
};
