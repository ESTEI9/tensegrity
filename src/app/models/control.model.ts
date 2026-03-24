import { ValidatorFn } from '@angular/forms';
import { SelectOption } from './select-option.model';
import { WritableSignal } from '@angular/core';

export const ControlTypes = ['text', 'select', 'multi-select', 'select-builder'] as const;
export const UpdateOnTypes = ['change', 'blur'] as const;

export type ControlType = (typeof ControlTypes)[number];
export type UpdateOnType = (typeof UpdateOnTypes)[number];

export class Control {
  name!: string | number;
  label?: string;
  initialValue?: unknown;
  controlType?: ControlType;
  validators?: ValidatorFn[];
  updateOn?: UpdateOnType = 'change';
  disabled?: boolean = false;

  constructor(config: Control) {
    Object.assign(this, config);
    this.controlType = config.controlType ?? 'text';
  }
}

export class SelectBuilderControl extends Control {
  declare initialValue?: void; // Is there a better way to revoke a property?
  options?: SelectOption[] | WritableSignal<SelectOption[]>;
  targetName!: string; // name of target control to apply options

  constructor(config: SelectBuilderControl) {
    config.controlType = 'select-builder';
    super(config);
    Object.assign(this, config);
  }
}

export class SelectControl extends Control {
  declare initialValue?: SelectOption;
  options!: SelectOption[] | WritableSignal<SelectOption[]>;

  constructor(config: SelectControl) {
    config.controlType = 'select';
    super(config);
    Object.assign(this, config);
  }
}

export class MultiSelectControl extends Control {
  declare initialValue?: SelectOption[] | undefined;
  options!: SelectOption[] | WritableSignal<SelectOption[]>;

  constructor(config: MultiSelectControl) {
    config.controlType = 'multi-select';
    super(config);
    Object.assign(this, config);
  }
}
