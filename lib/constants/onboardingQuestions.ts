// Simplified onboarding questions for new flow variants
// TODO: Replace with new priority quiz and mini assessment questions

import type { OnboardingItem } from '@/lib/stores/onboardingStore';

// Priority Quiz Questions (4 questions with SF Symbols)
export const priorityQuestions: OnboardingItem[] = [
  {
    id: 'priority-1',
    type: 'priority',
    question: "What's your main goal?",
    options: [
      'Build healthy habits',
      'Break bad habits',
      'Boost productivity',
      'Find life balance',
    ],
    optionIcons: ['heart.fill', 'xmark.circle.fill', 'bolt.fill', 'scale.3d'],
  },
  {
    id: 'priority-2',
    type: 'priority',
    question: 'What usually stops you?',
    options: [
      'Lack of motivation',
      'Too busy/no time',
      "Don't know how to start",
      "Can't stay consistent",
    ],
    optionIcons: [
      'battery.25',
      'clock.fill',
      'questionmark.circle.fill',
      'arrow.3.trianglepath',
    ],
  },
  {
    id: 'priority-3',
    type: 'priority',
    question: 'When do you feel most focused?',
    options: [
      'Early morning (5-9 AM)',
      'Mid-day (9 AM-2 PM)',
      'Evening (2-8 PM)',
      'Night (8 PM+)',
    ],
    optionIcons: [
      'sunrise.fill',
      'sun.max.fill',
      'sunset.fill',
      'moon.stars.fill',
    ],
  },
  {
    id: 'priority-4',
    type: 'priority',
    question: 'How do you prefer to track progress?',
    options: [
      'Simple streaks',
      'Detailed statistics',
      'Visual achievements',
      'Quick check-ins',
    ],
    optionIcons: [
      'flame.fill',
      'chart.bar.fill',
      'star.circle.fill',
      'checkmark.circle.fill',
    ],
  },
];

// Mini Assessment Questions (10 Likert questions - 2 per category)
export const miniAssessmentQuestions: OnboardingItem[] = [
  // Vitality (cat1)
  {
    id: 'mini-vitality-1',
    type: 'mini',
    question: 'How would you rate your energy levels?',
    options: [
      'Always tired',
      'Often low energy',
      'Usually energized',
      'Full of energy',
    ],
    optionIcons: ['battery.0', 'battery.25', 'battery.75', 'battery.100'],
  },
  {
    id: 'mini-vitality-2',
    type: 'mini',
    question: 'How consistent is your sleep schedule?',
    options: [
      'Very irregular',
      'Somewhat irregular',
      'Mostly consistent',
      'Very consistent',
    ],
    optionIcons: [
      'moon.zzz.fill',
      'moon.circle.fill',
      'bed.double.circle.fill',
      'alarm.fill',
    ],
  },

  // Wisdom (cat2)
  {
    id: 'mini-wisdom-1',
    type: 'mini',
    question: 'How often do you learn something new?',
    options: ['Rarely', 'Sometimes', 'Often', 'Daily'],
    optionIcons: [
      'book.closed.fill',
      'book.circle.fill',
      'graduationcap.fill',
      'brain.head.profile',
    ],
  },
  {
    id: 'mini-wisdom-2',
    type: 'mini',
    question: 'How well can you focus on tasks?',
    options: [
      'Very easily distracted',
      'Sometimes distracted',
      'Usually focused',
      'Laser focused',
    ],
    optionIcons: [
      'iphone.circle.fill',
      'eye.slash.fill',
      'eye.circle.fill',
      'target',
    ],
  },

  // Harmony (cat3)
  {
    id: 'mini-harmony-1',
    type: 'mini',
    question: 'How strong are your relationships?',
    options: [
      'Need improvement',
      'Could be better',
      'Pretty good',
      'Very strong',
    ],
    optionIcons: [
      'person.slash.fill',
      'person.circle.fill',
      'person.2.circle.fill',
      'heart.circle.fill',
    ],
  },
  {
    id: 'mini-harmony-2',
    type: 'mini',
    question: 'How much time do you spend with loved ones?',
    options: ['Not enough', 'Could be more', 'Good amount', 'Plenty of time'],
    optionIcons: [
      'clock.badge.exclamationmark.fill',
      'clock.circle.fill',
      'person.3.fill',
      'house.fill',
    ],
  },

  // Spirit (cat4)
  {
    id: 'mini-spirit-1',
    type: 'mini',
    question: 'How well do you handle stress?',
    options: [
      'Struggle a lot',
      'Sometimes struggle',
      'Handle it well',
      'Very resilient',
    ],
    optionIcons: [
      'exclamationmark.triangle.fill',
      'face.dashed.fill',
      'leaf.circle.fill',
      'figure.mind.and.body',
    ],
  },
  {
    id: 'mini-spirit-2',
    type: 'mini',
    question: 'How often do you practice mindfulness?',
    options: ['Never', 'Occasionally', 'Regularly', 'Daily practice'],
    optionIcons: [
      'xmark.circle.fill',
      'moon.circle.fill',
      'leaf.arrow.circlepath',
      'figure.mind.and.body',
    ],
  },

  // Ambition (cat5)
  {
    id: 'mini-ambition-1',
    type: 'mini',
    question: 'How organized do you feel?',
    options: [
      'Very disorganized',
      'Somewhat messy',
      'Pretty organized',
      'Highly organized',
    ],
    optionIcons: [
      'tornado',
      'questionmark.folder.fill',
      'folder.fill',
      'archivebox.fill',
    ],
  },
  {
    id: 'mini-ambition-2',
    type: 'mini',
    question: 'How often do you achieve your goals?',
    options: [
      'Rarely finish',
      'Sometimes finish',
      'Usually finish',
      'Always finish',
    ],
    optionIcons: [
      'flag.slash.fill',
      'flag.circle.fill',
      'checkmark.circle.fill',
      'trophy.fill',
    ],
  },
];

// Loading and Matrix screens
export const customScreens: OnboardingItem[] = [
  {
    id: 'loading',
    type: 'loading',
    required: false,
  },
  {
    id: 'matrix-grid',
    type: 'matrix',
    required: false,
  },
];

// Flow Variant Configurations
export const flowVariants = {
  minimal: {
    name: 'minimal',
    items: [
      ...priorityQuestions,
      customScreens.find((s) => s.id === 'loading')!,
    ],
  },
  medium: {
    name: 'medium',
    items: [
      ...priorityQuestions,
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'loading')!,
    ],
  },
  maximum: {
    name: 'maximum',
    items: [
      ...priorityQuestions,
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'loading')!,
      customScreens.find((s) => s.id === 'matrix-grid')!,
    ],
  },
} as const;

export function getOnboardingItems(variant: string): OnboardingItem[] {
  const config = flowVariants[variant as keyof typeof flowVariants];
  return [...(config?.items || flowVariants.minimal.items)]; // Default to minimal
}
