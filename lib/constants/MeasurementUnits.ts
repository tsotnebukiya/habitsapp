export type MeasurementCategory =
  | 'count'
  | 'time'
  | 'distance'
  | 'volume'
  | 'weight'
  | 'currency'
  | 'food';

export interface MeasurementUnit {
  id: string;
  oneName: string;
  name: string;
  shortName: string;
  category: MeasurementCategory;
  baseIncrement: number;
  defaultGoal: number;
}

export const MeasurementUnits: Record<string, MeasurementUnit> = {
  /* Generic counters */
  count: {
    id: 'count',
    oneName: 'Time',
    name: 'Times',
    shortName: '×',
    category: 'count',
    baseIncrement: 1,
    defaultGoal: 1,
  },

  /* Time-based units */
  minutes: {
    id: 'minutes',
    oneName: 'Minute',
    name: 'Minutes',
    shortName: 'min',
    category: 'time',
    baseIncrement: 5,
    defaultGoal: 30,
  },
  hours: {
    id: 'hours',
    oneName: 'Hour',
    name: 'Hours',
    shortName: 'h',
    category: 'time',
    baseIncrement: 0.5,
    defaultGoal: 1,
  },

  /* Distance / steps */
  kilometers: {
    id: 'kilometers',
    oneName: 'Kilometer',
    name: 'Kilometers',
    shortName: 'km',
    category: 'distance',
    baseIncrement: 0.5,
    defaultGoal: 5,
  },
  steps: {
    id: 'steps',
    oneName: 'Step',
    name: 'Steps',
    shortName: 'steps',
    category: 'count',
    baseIncrement: 100,
    defaultGoal: 8000,
  },

  /* Volume */
  liters: {
    id: 'liters',
    oneName: 'Liter',
    name: 'Liters',
    shortName: 'L',
    category: 'volume',
    baseIncrement: 0.25,
    defaultGoal: 2,
  },
  glasses: {
    id: 'glasses',
    oneName: 'Glass',
    name: 'Glasses',
    shortName: 'gl',
    category: 'volume',
    baseIncrement: 1,
    defaultGoal: 8,
  },

  /* Food portions */
  servings: {
    id: 'servings',
    oneName: 'Serving',
    name: 'Servings',
    shortName: 'srv',
    category: 'food',
    baseIncrement: 1,
    defaultGoal: 5,
  },

  /* Writing / learning */
  words: {
    id: 'words',
    oneName: 'Word',
    name: 'Words',
    shortName: 'w',
    category: 'count',
    baseIncrement: 50,
    defaultGoal: 500,
  },
  pages: {
    id: 'pages',
    oneName: 'Page',
    name: 'Pages',
    shortName: 'pg',
    category: 'count',
    baseIncrement: 1,
    defaultGoal: 10,
  },

  /* Money */
  dollars: {
    id: 'dollars',
    oneName: 'Dollar',
    name: 'USD',
    shortName: '$',
    category: 'currency',
    baseIncrement: 1,
    defaultGoal: 10,
  },
} as const;
