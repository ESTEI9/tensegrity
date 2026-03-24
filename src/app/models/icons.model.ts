export const iconNames = ['close', 'add'] as const;

export type IconName = (typeof iconNames)[number];
