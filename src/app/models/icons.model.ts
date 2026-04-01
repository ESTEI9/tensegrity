export const iconNames = ['close', 'add', 'arrow_back', 'token'] as const;

export type IconName = (typeof iconNames)[number];
