export const iconNames = ['close', 'add', 'arrow_back'] as const;

export type IconName = (typeof iconNames)[number];
