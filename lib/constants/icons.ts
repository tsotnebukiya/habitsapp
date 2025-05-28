import { type MaterialIcons } from '@expo/vector-icons';
import { SFSymbol } from 'expo-symbols';

export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type IconType = MaterialIconName | string;

/* ---------- 1. CORE PICKER ---------- */
export const PRIME_ICON_NAMES: SFSymbol[] = [
  /* Row 1 – Health / Vitality */
  'dumbbell',
  'drop',
  'bed.double',
  'figure.walk',
  'leaf',
  'fork.knife',

  /* Row 2 – Habits to avoid & learning */
  'nosign',
  'iphone',
  'book.closed',
  'music.note',
  'lightbulb',
  'graduationcap',

  /* Row 3 – Social / Harmony */
  'person.3',
  'heart',
  'hands.sparkles',
  'face.smiling',
  'pawprint',
  'hand.wave',

  /* Row 4 – Spirit / Reflection */
  'figure.mind.and.body',
  'square.and.pencil',
  'mic',
  'alarm',
  'checkmark.circle',

  /* Row 5 – Productivity / Finance */
  'timer',
  'briefcase',
  'banknote',
  'dollarsign.circle',
  'chart.pie',
  'chart.line.uptrend.xyaxis',
];

/* ---------- 2. EXTENDED PALETTE ---------- */
export const EXTRA_ICON_NAMES: SFSymbol[] = [
  /* Food & Rest (×10) */
  'cup.and.saucer',
  'takeoutbag.and.cup.and.straw',
  'wineglass',
  'waterbottle',
  'carrot',
  'birthday.cake',
  'fork.knife.circle',
  'mug',
  'zzz',
  'sleep',

  /* Learning & Creativity (×10) */
  'book',
  'graduationcap.circle',
  'pencil',
  'paintpalette',
  'paintbrush',
  'lightbulb.fill',
  'brain',
  'backpack',
  'ruler',
  'globe.europe.africa',

  /* Digital Well-being & Media (×10) */
  'tv',
  'gamecontroller',
  'music.note.list',
  'play.circle',
  'film',

  'headphones',
  'laptopcomputer',
  'keyboard',
  'magnifyingglass',

  /* Social & Community (×10) */
  'bubble.left',
  'bubble.left.and.bubble.right',
  'heart.circle',
  'hand.raised',
  'hands.clap',
  'megaphone',
  'sparkles',

  /* Hobbies & Play (×8) */
  'figure.run',
  'figure.tennis',
  'figure.soccer',
  'figure.badminton',
  'figure.yoga',
  'figure.surfing',
  'figure.cooldown',
  'bicycle',

  /* Productivity & Time (×10) */
  'calendar',
  'clock',
  'stopwatch',
  'checklist',
  'note.text',
  'doc.text',
  'paperplane',
  'tray',
  'bookmark',
  'bell',

  /* Finance & Work (×6) */
  'creditcard',
  'cart',
  'bag',
  'banknote.fill',
  'wallet.pass',
  'dollarsign.square',

  'antenna.radiowaves.left.and.right',
  'battery.25',
  'calendar.badge.clock',
  'calendar.badge.exclamationmark',
  'car.fill',
  'clock.badge.exclamationmark',
  'dollarsign.circle.fill',
  'face.dashed',
  'flag',
  'flame',
  'hammer',
  'hand.thumbsup',
  'hand.thumbsdown',
  'heart.slash',
  'iphone.slash',
  'mic.slash',
  'moon.stars',
  'pills',
  'puzzlepiece',
  'questionmark.circle',
  'arrow.3.trianglepath',
  'smoke',
  'sofa',
  'timer.square',
  'trash',
  'wind',
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
