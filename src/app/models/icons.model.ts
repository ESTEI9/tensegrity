export const iconNames = [
  'close',
  'add',
  'arrow_back',
  'token',
  'keyboard_arrow_down',
  'keyboard_arrow_up',
] as const;

export type IconName = (typeof iconNames)[number];
