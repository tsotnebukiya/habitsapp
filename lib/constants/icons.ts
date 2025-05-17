import { type MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type IconType = MaterialIconName | string;

export const PRIME_ICON_NAMES: MaterialIconName[] = [
  /* Row 1 – Health / Vitality */
  'fitness-center',
  'local-drink',
  'hotel',
  'directions-walk',
  'spa',
  'fastfood',

  /* Row 2 – Habits to avoid & learning */
  'smoking-rooms',
  'phone-android',
  'menu-book',
  'music-note',
  'extension',
  'lightbulb',

  /* Row 3 – Social / Harmony */
  'groups',
  'favorite',
  'volunteer-activism',
  'cleaning-services',
  'emoji-emotions',
  'pets',

  /* Row 4 – Spirit / Reflection */
  'self-improvement',
  'note-alt',
  'record-voice-over',
  'alarm',
  'rocket-launch',
  'task',

  /* Row 5 – Productivity / Finance */
  'timer',
  'work',
  'savings',
  'attach-money',
  'pie-chart',
  'park',
];

export const EXTRA_ICON_NAMES: MaterialIconName[] = [
  'local-dining',
  'accessibility-new',
  'medical-services',
  'free-breakfast',
  'tag-faces',
  'emoji-food-beverage',
  'icecream',
  'snooze',
  'local-bar',
  'local-cafe',
  'nights-stay',
  'airline-seat-recline-normal',

  'language',
  'school',
  'edit',
  'quiz',
  'public',
  'spellcheck',

  'phone-iphone',
  'tv',
  'sports-esports',
  'library-books',
  'article',
  'rss-feed',
  'laptop-chromebook',
  'search',
  'forum',
  'ondemand-video',

  'chat',
  'recycling',
  'phone-disabled',
  'thumb-up',

  'smartphone',
  'weekend',
  'directions-car',
  'sms-failed',
  'campaign',
  'question-answer',
  'delete',
  'watch-later',
  'heart-broken',
  'voice-over-off',

  'favorite-border',
  'emoji-people',
  'air',
  'auto-stories',
  'psychology',
  'palette',

  'mood-bad',
  'whatshot',
  'thumb-down',
  'sentiment-very-dissatisfied',
  'loop',
  'compare',
  'star-outline',
  'gavel',
  'mood',
  'battery-alert',

  'handshake',
  'inbox',
  'pending-actions',
  'timer-off',
  'shopping-cart',
  'event-busy',
  'money-off',
  'work-off',
  'assignment-late',
  'shopping-bag',
  'flag',
  'no-food',
];

export const PRIME_EMOJIS: string[] = [
  '💪',
  '🥦',
  '🍎',
  '💧',
  '🚶',
  '🏋️‍♂️',
  '🛌',
  '🧘',
  '☀️',
  '🎯',
  '📚',
  '🎵',
  '📝',
  '💡',
  '💻',
  '🎨',
  '❤️',
  '🤝',
  '😊',
  '🐾',
  '🏆',
  '📈',
  '💰',
  '⏰',
  '📅',
  '🚭',
  '🍔',
  '📱',
  '☕️',
  '🎮',
];

/*  Extra emoji set: 170 glyphs (prime grid covers the first 36)  */
export const EXTRA_EMOJIS: string[] = [
  /* Food & drink (10) */
  '🥑',
  '🍓',
  '🍞',
  '🥗',
  '🍕',
  '🍟',
  '🍣',
  '🍷',
  '🥤',
  '🍪',

  /* Sports & fitness (10) */
  '⚽️',
  '🏀',
  '🏈',
  '🎾',
  '🏊‍♀️',
  '🚴‍♂️',
  '🏃‍♂️',
  '🏹',
  '⛳️',
  '🏄‍♀️',

  /* Learning / productivity (8) */
  '🧠',
  '🧑‍🎓',
  '📊',
  '📌',
  '📣',
  '🔬',
  '🔍',
  '🧰',

  /* Spiritual & reflective (6) */
  '🕊️',
  '☮️',
  '🕉️',
  '☯️',
  '🙏',
  '🔔',

  /* Social & emotional (12) */
  '👪',
  '💑',
  '🗣️',
  '🤗',
  '🤔',
  '😄',
  '😢',
  '😡',
  '😍',
  '🥳',
  '❤️‍🔥',
  '💔',

  /* Animals (8) */
  '🐶',
  '🐱',
  '🐻',
  '🦁',
  '🐢',
  '🐬',
  '🦋',
  '🐞',

  /* Nature & outdoors (6) */
  '🌳',
  '🌸',
  '🌊',
  '🏔️',
  '🏖️',
  '🌋',

  /* Finance & work (5) */
  '🪙',
  '🏦',
  '💸',
  '💹',
  '💷',

  /* Misc. tools & objects (5) */
  '📆',
  '💿',
  '🚗',
  '🛒',
  '🔑',
];
