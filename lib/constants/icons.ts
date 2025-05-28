import { type MaterialIcons } from '@expo/vector-icons';
import { SFSymbol } from 'expo-symbols';

export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type IconType = MaterialIconName | string;

export const HABIT_SYMBOLS: SFSymbol[] = [
  /* ── Vitality – GOOD ── */
  'dumbbell.fill',
  'drop.fill',
  'leaf.fill',
  'bed.double.fill',
  'figure.cooldown.circle.fill',
  'pills.fill',
  'cup.and.saucer.fill',
  'figure.walk.circle.fill',
  'mouth.fill',
  'leaf.circle.fill',

  /* Vitality – BAD */
  'takeoutbag.and.cup.and.straw.fill',
  'mug.fill',
  'smoke.fill',
  'iphone.circle.fill',
  'birthday.cake.fill',
  'zzz', // ← was zzz.circle.fill
  'wineglass.fill',
  'waterbottle.fill',
  'moon.stars.fill',
  'figure.cooldown', // ← was figure.cooldown.square.fill

  /* ── Wisdom – GOOD ── */
  'book.closed.fill',
  'globe.europe.africa.fill',
  'music.note.list',
  'puzzlepiece.fill',
  'lightbulb.fill',
  'graduationcap.fill',
  'square.and.pencil.circle.fill',
  'questionmark.circle.fill',
  'newspaper.fill',
  'textformat.abc.dottedunderline',

  /* Wisdom – BAD */
  'iphone.slash.circle.fill',
  'tv.fill',
  'gamecontroller.fill',
  'book.circle.fill',
  'gobackward', // ← was gobackward.circle.fill
  'antenna.radiowaves.left.and.right.circle.fill',
  'laptopcomputer.slash',
  'magnifyingglass.circle.fill',
  'bubble.left.and.bubble.right.fill',
  'play.tv.fill',

  /* ── Harmony – GOOD ── */
  'person.3.sequence.fill',
  'bubble.left.and.exclamationmark.bubble.right.fill',
  'hands.sparkles.fill',
  'trash.circle.fill',
  'arrow.clockwise.circle.fill',
  'hand.thumbsup.circle.fill',
  'heart.circle.fill',
  'pawprint.fill',
  'face.smiling.fill',

  /* Harmony – BAD */
  'sofa.fill',
  'car.fill',
  'bubble.left.fill',
  'megaphone.fill',
  'exclamationmark.bubble.fill', // ← was bubble.left.and.bubble.right.fill.badge.exclamationmark
  'trash.slash.circle.fill',
  'clock.badge.exclamationmark.fill',
  'heart.slash.circle.fill',
  'mic.slash.circle.fill',

  /* ── Spirit – GOOD ── */
  'figure.mind.and.body.circle.fill',
  'pencil.circle.fill',
  'heart.text.square.fill',
  'wind.circle.fill',
  'mic.fill',
  'book.fill',
  'brain.head.profile',
  'leaf.arrow.circlepath',
  'paintpalette.fill',

  /* Spirit – BAD */
  'face.dashed.fill',
  'flame.fill',
  'hand.thumbsdown.circle.fill',
  'face.smiling.inverse',
  'arrow.2.circlepath.circle.fill',
  'arrow.left.arrow.right.circle.fill',
  'star.circle.fill',
  'hammer.circle.fill',
  'figure.stand.line.dotted.figure.stand',
  'battery.25',

  /* ── Ambition – GOOD ── */
  'alarm.fill',
  'paperplane.circle.fill',
  'checkmark.circle.fill',
  'timer.circle.fill',
  'briefcase.fill',
  'hand.wave.fill',
  'banknote.fill',
  'tray.full.fill',
  'dollarsign.circle.fill',
  'chart.pie.fill',

  /* Ambition – BAD */
  'calendar.badge.clock',
  'timer',
  'cart.fill',
  'calendar.badge.exclamationmark',
  'creditcard.fill', // ← was banknote.slash
  'briefcase.circle.fill',
  'doc.badge.clock.fill',
  'bag.fill',
  'flag.slash.circle.fill',
  'fork.knife.circle.fill',

  /* ─────────────────────────────────── */
  /* EXTRA 38 SYMBOLS                    */
  'arrow.up.forward.app.fill',
  'arrow.down.circle.fill',
  'bell.circle.fill',
  'bookmark.circle.fill',
  'bolt.heart.fill',
  'bubble.middle.bottom.fill',
  'calendar.circle.fill',
  'capsule.portrait.fill',
  'cloud.sun.fill',
  'command.circle.fill',
  'cube.box.fill',
  'doc.richtext.fill',
  'envelope.open.fill',
  'eye.circle.fill',
  'gearshape.2.fill',
  'gift.fill',
  'globe.americas.fill',
  'hand.tap.fill',
  'headphones.circle.fill',
  'hourglass.circle.fill',
  'figure.rower',
  'figure.tennis.circle.fill',
  'figure.skiing.downhill.circle.fill',
  'key.fill',
  'link.circle.fill',
  'lock.open.fill',
  'map.fill',
  'medal.fill',
  'music.quarternote.3',
  'paintbrush.pointed.fill',
  'paperclip.circle.fill',
  'person.crop.circle.badge.plus',
  'shield.lefthalf.filled',
  'sparkles.tv.fill',
  'sun.max.circle.fill',
  'target',
  'trophy.fill',
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
