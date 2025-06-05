import type { OnboardingItem } from '@/lib/stores/onboardingStore';

// Priority Questions (used in all variants)
export const priorityQuestions: OnboardingItem[] = [
  {
    id: 'priority-1',
    type: 'priority',
    block: 'PriorityQuiz',
    question: 'What is your main focus for building better habits?',
    options: [
      'Improving my health and fitness',
      'Being more productive at work',
      'Better relationships with family/friends',
      'Personal growth and learning',
    ],
    required: true,
  },
  {
    id: 'priority-2',
    type: 'priority',
    block: 'PriorityQuiz',
    question: 'When do you find it easiest to stick to new habits?',
    options: [
      'First thing in the morning',
      'During lunch breaks',
      'Right after work',
      'Before going to bed',
    ],
    required: true,
  },
  {
    id: 'priority-3',
    type: 'priority',
    block: 'PriorityQuiz',
    question: 'What usually prevents you from maintaining habits?',
    options: [
      'Forgetting to do them',
      'Lack of motivation',
      'Too busy/no time',
      'Results take too long to see',
    ],
    required: true,
  },
  {
    id: 'priority-4',
    type: 'priority',
    block: 'PriorityQuiz',
    question: 'How do you prefer to track your progress?',
    options: [
      'Simple checkmarks/streaks',
      'Detailed metrics and charts',
      'Visual progress indicators',
      'Social sharing and accountability',
    ],
    required: true,
  },
];

// Mini Assessment Questions (2 per category)
export const miniAssessmentQuestions: OnboardingItem[] = [
  // Motivation questions
  {
    id: 'mini-motivation-1',
    type: 'mini',
    block: 'MiniAssessment',
    question: 'I feel energized about making positive changes in my life',
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },
  {
    id: 'mini-motivation-2',
    type: 'mini',
    block: 'MiniAssessment',
    question: 'I have clear reasons for wanting to build new habits',
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },

  // Consistency questions
  {
    id: 'mini-consistency-1',
    type: 'mini',
    block: 'MiniAssessment',
    question: 'I typically follow through on commitments I make to myself',
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },
  {
    id: 'mini-consistency-2',
    type: 'mini',
    block: 'MiniAssessment',
    question: "I can maintain routines even when I don't feel like it",
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },

  // Goals questions
  {
    id: 'mini-goals-1',
    type: 'mini',
    block: 'MiniAssessment',
    question: 'I have specific, measurable goals for my habits',
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },
  {
    id: 'mini-goals-2',
    type: 'mini',
    block: 'MiniAssessment',
    question: 'I regularly review and adjust my goals based on progress',
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    required: true,
  },
];

// Custom screens (not questions)
export const customScreens: OnboardingItem[] = [
  {
    id: 'mini-result',
    type: 'mini-result',
    block: 'MiniAssessment',
    isCustomScreen: true,
  },
  {
    id: 'pick-habit',
    type: 'habit',
    block: 'PickOneHabit',
    isCustomScreen: true,
  },
  {
    id: 'spinner-tailor',
    type: 'spinner',
    block: 'SpinnerTailor',
    isCustomScreen: true,
  },
];

// Variant configurations
export const variantConfigs = {
  'fast-lane': {
    blocks: ['PriorityQuiz'],
    items: [...priorityQuestions],
  },
  'insight-path': {
    blocks: ['PriorityQuiz', 'MiniAssessment', 'SpinnerTailor'],
    items: [
      ...priorityQuestions,
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'mini-result')!,
      customScreens.find((s) => s.id === 'spinner-tailor')!,
    ],
  },
  'commitment-path': {
    blocks: ['MiniAssessment', 'PickOneHabit', 'SpinnerTailor'],
    items: [
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'mini-result')!,
      customScreens.find((s) => s.id === 'pick-habit')!,
      customScreens.find((s) => s.id === 'spinner-tailor')!,
    ],
  },
} as const;

export function getOnboardingItems(variant: string): OnboardingItem[] {
  const config = variantConfigs[variant as keyof typeof variantConfigs];
  return config ? [...config.items] : [];
}
