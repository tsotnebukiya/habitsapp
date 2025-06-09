// Simplified onboarding questions for new flow variants
// TODO: Replace with new priority quiz and mini assessment questions

import type { OnboardingItem } from '@/lib/stores/onboardingStore';

// Priority Quiz Questions (4 questions with SF Symbols)
export const priorityQuestions: OnboardingItem[] = [
  {
    id: 'priority-1',
    type: 'priority',
    questionKey: 'onboarding.questions.priority.question1.question',
    optionKeys: [
      'onboarding.questions.priority.question1.options.option1',
      'onboarding.questions.priority.question1.options.option2',
      'onboarding.questions.priority.question1.options.option3',
      'onboarding.questions.priority.question1.options.option4',
    ],
    optionIcons: ['heart.fill', 'xmark.circle.fill', 'bolt.fill', 'scale.3d'],
  },
  {
    id: 'priority-2',
    type: 'priority',
    questionKey: 'onboarding.questions.priority.question2.question',
    optionKeys: [
      'onboarding.questions.priority.question2.options.option1',
      'onboarding.questions.priority.question2.options.option2',
      'onboarding.questions.priority.question2.options.option3',
      'onboarding.questions.priority.question2.options.option4',
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
    questionKey: 'onboarding.questions.priority.question3.question',
    optionKeys: [
      'onboarding.questions.priority.question3.options.option1',
      'onboarding.questions.priority.question3.options.option2',
      'onboarding.questions.priority.question3.options.option3',
      'onboarding.questions.priority.question3.options.option4',
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
    questionKey: 'onboarding.questions.priority.question4.question',
    optionKeys: [
      'onboarding.questions.priority.question4.options.option1',
      'onboarding.questions.priority.question4.options.option2',
      'onboarding.questions.priority.question4.options.option3',
      'onboarding.questions.priority.question4.options.option4',
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
    questionKey: 'onboarding.questions.mini.vitality1.question',
    optionKeys: [
      'onboarding.questions.mini.vitality1.options.option1',
      'onboarding.questions.mini.vitality1.options.option2',
      'onboarding.questions.mini.vitality1.options.option3',
      'onboarding.questions.mini.vitality1.options.option4',
    ],
    optionIcons: ['battery.0', 'battery.25', 'battery.75', 'battery.100'],
  },
  {
    id: 'mini-vitality-2',
    type: 'mini',
    questionKey: 'onboarding.questions.mini.vitality2.question',
    optionKeys: [
      'onboarding.questions.mini.vitality2.options.option1',
      'onboarding.questions.mini.vitality2.options.option2',
      'onboarding.questions.mini.vitality2.options.option3',
      'onboarding.questions.mini.vitality2.options.option4',
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
    questionKey: 'onboarding.questions.mini.wisdom1.question',
    optionKeys: [
      'onboarding.questions.mini.wisdom1.options.option1',
      'onboarding.questions.mini.wisdom1.options.option2',
      'onboarding.questions.mini.wisdom1.options.option3',
      'onboarding.questions.mini.wisdom1.options.option4',
    ],
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
    questionKey: 'onboarding.questions.mini.wisdom2.question',
    optionKeys: [
      'onboarding.questions.mini.wisdom2.options.option1',
      'onboarding.questions.mini.wisdom2.options.option2',
      'onboarding.questions.mini.wisdom2.options.option3',
      'onboarding.questions.mini.wisdom2.options.option4',
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
    questionKey: 'onboarding.questions.mini.harmony1.question',
    optionKeys: [
      'onboarding.questions.mini.harmony1.options.option1',
      'onboarding.questions.mini.harmony1.options.option2',
      'onboarding.questions.mini.harmony1.options.option3',
      'onboarding.questions.mini.harmony1.options.option4',
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
    questionKey: 'onboarding.questions.mini.harmony2.question',
    optionKeys: [
      'onboarding.questions.mini.harmony2.options.option1',
      'onboarding.questions.mini.harmony2.options.option2',
      'onboarding.questions.mini.harmony2.options.option3',
      'onboarding.questions.mini.harmony2.options.option4',
    ],
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
    questionKey: 'onboarding.questions.mini.spirit1.question',
    optionKeys: [
      'onboarding.questions.mini.spirit1.options.option1',
      'onboarding.questions.mini.spirit1.options.option2',
      'onboarding.questions.mini.spirit1.options.option3',
      'onboarding.questions.mini.spirit1.options.option4',
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
    questionKey: 'onboarding.questions.mini.spirit2.question',
    optionKeys: [
      'onboarding.questions.mini.spirit2.options.option1',
      'onboarding.questions.mini.spirit2.options.option2',
      'onboarding.questions.mini.spirit2.options.option3',
      'onboarding.questions.mini.spirit2.options.option4',
    ],
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
    questionKey: 'onboarding.questions.mini.ambition1.question',
    optionKeys: [
      'onboarding.questions.mini.ambition1.options.option1',
      'onboarding.questions.mini.ambition1.options.option2',
      'onboarding.questions.mini.ambition1.options.option3',
      'onboarding.questions.mini.ambition1.options.option4',
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
    questionKey: 'onboarding.questions.mini.ambition2.question',
    optionKeys: [
      'onboarding.questions.mini.ambition2.options.option1',
      'onboarding.questions.mini.ambition2.options.option2',
      'onboarding.questions.mini.ambition2.options.option3',
      'onboarding.questions.mini.ambition2.options.option4',
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
  {
    id: 'what-youll-get',
    type: 'value',
    required: false,
  },
];

// Flow Variant Configurations
export const flowVariants = {
  quick: {
    name: 'quick',
    description: 'Priority questions only',
    items: [
      ...priorityQuestions,
      customScreens.find((s) => s.id === 'loading')!,
    ],
  },
  standard: {
    name: 'standard',
    description: 'Priority + mini assessment',
    items: [
      ...priorityQuestions,
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'loading')!,
    ],
  },
  preview: {
    name: 'preview',
    description: 'Priority + value preview',
    items: [
      ...priorityQuestions,
      customScreens.find((s) => s.id === 'loading')!,
      customScreens.find((s) => s.id === 'what-youll-get')!,
    ],
  },
  complete: {
    name: 'complete',
    description: 'Full assessment + matrix + value',
    items: [
      ...priorityQuestions,
      ...miniAssessmentQuestions,
      customScreens.find((s) => s.id === 'loading')!,
      customScreens.find((s) => s.id === 'matrix-grid')!,
      customScreens.find((s) => s.id === 'what-youll-get')!,
    ],
  },
} as const;

// Suggested A/B Testing Distribution:
// quick: 30% - Test speed vs engagement
// standard: 25% - Current baseline
// preview: 25% - Test value prop impact
// complete: 20% - Full experience for engaged users

export function getOnboardingItems(variant: string): OnboardingItem[] {
  const config = flowVariants[variant as keyof typeof flowVariants];
  return [...(config?.items || flowVariants.quick.items)]; // Default to quick
}
