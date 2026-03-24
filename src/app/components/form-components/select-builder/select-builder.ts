import {
  Component,
  input,
  isWritableSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Textbox } from '../textbox/textbox';
import { Chip } from '../../chip/chip';
import { Control, SelectBuilderControl, SelectControl, SelectOption } from '../../../models';
import { Validators } from '@angular/forms';
import { Icon } from '../../icon/icon';

@Component({
  selector: 'app-select-builder',
  imports: [Textbox, Chip, Icon],
  templateUrl: './select-builder.html',
  styleUrl: './select-builder.scss',
})
export class SelectBuilder implements OnInit, OnChanges, OnDestroy {
  control = input<SelectBuilderControl>();
  presetOptions = input<SelectOption[]>();
  setOptions = output<SelectOption[]>({ alias: 'options' });

  @ViewChild('value') valueBox!: Textbox;
  @ViewChild('displayValue') displayValueBox!: Textbox;

  protected valueCtrl = new Control({
    name: 'value',
    label: 'Value',
    validators: [Validators.required],
  });

  protected displayValueCtrl = new Control({
    name: 'displayValue',
    label: 'Display Value',
  });

  pendingOption = {} as SelectOption;
  protected options = new Map<string, SelectOption>();

  ngOnChanges(changes: SimpleChanges): void {
    const control = changes['control']?.currentValue as SelectBuilderControl | undefined;

    if (control) {
      const options = isWritableSignal(control.options) ? control.options() : control.options;
      options?.forEach((option) => this.options.set(String(option.value), option));
    }
  }

  ngOnInit(): void {
    const presetOptions = this.presetOptions();

    if (presetOptions)
      presetOptions.forEach((option) => this.options.set(String(option.value), option));
  }

  deleteOption(option: SelectOption) {
    this.options.delete(String(option.value));
    this.setOptions.emit(Array.from(this.options.values()));
  }

  addOption() {
    const newValue = String(this.pendingOption.value);
    if (newValue.length && !this.options.has(newValue))
      this.options.set(newValue, this.pendingOption);
    this.pendingOption = {} as SelectOption;
    this.valueBox.clear();
    this.displayValueBox.clear();
    this.setOptions.emit(Array.from(this.options.values()));
  }

  ngOnDestroy(): void {
    // remove options for the select dependent on this builder
    this.setOptions.emit([]);
  }
}
