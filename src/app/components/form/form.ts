import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  input,
  isWritableSignal,
  OnChanges,
  output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { Textbox, Select, MultiSelect } from '../form-components';
import {
  FormArray,
  FormArrayDirective,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { FormConfig } from '../../models/form-config.model';
import {
  Control,
  MultiSelectControl,
  SelectBuilderControl,
  SelectControl,
} from '../../models/control.model';
import { SelectBuilder } from '../form-components/select-builder/select-builder';
import { SelectOption } from '../../models';

@Component({
  selector: 'app-form',
  imports: [FormsModule, ReactiveFormsModule, Textbox, Select, SelectBuilder, MultiSelect],
  providers: [FormArrayDirective],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnChanges {
  config = input.required<FormConfig>();
  formUpdate = output<FormArray>({ alias: 'form' });
  resetForm = output<void>({ alias: 'reset' });

  private cd = inject(ChangeDetectorRef);

  @ViewChildren(Select) selects: QueryList<Select> | undefined;
  @ViewChildren(Textbox) textboxes: QueryList<Textbox> | undefined;
  @ViewChildren(MultiSelect) multiselects: QueryList<MultiSelect> | undefined;

  protected formGroup!: FormGroup<{
    formArray: FormArray<FormControl<unknown>>;
  }>;

  ngOnChanges(changes: SimpleChanges): void {
    const configChanges = changes['config']?.currentValue;

    if (configChanges) this.buildForm();
  }

  buildForm() {
    const config = this.config();
    const controls = config.controls.map((ctrl) => {
      const control = new FormControl(ctrl.initialValue);

      if (ctrl.disabled) control.disable();

      return control;
    });

    this.formGroup = new FormGroup({ formArray: new FormArray(controls) });
    this.outputForm();
  }

  addControl(control: Control, atIndex?: number) {
    const controlIndex = this.getControlIndex(control.name);
    if (controlIndex !== undefined) {
      this.setControl(control, atIndex);
      return;
    }

    const formControl = new FormControl(
      control.initialValue,
      control.validators,
    ) as FormControl<string>;

    if (control.disabled) formControl.disable();
    atIndex ? this.controls.splice(atIndex, 0, formControl) : this.controls.push(formControl);
  }

  setControl(control: Control, controlIndex?: number) {
    const formControl = new FormControl(
      control.initialValue,
      control.validators,
    ) as FormControl<string>;
    controlIndex
      ? this.formGroup.controls.formArray.setControl(controlIndex, formControl)
      : this.addControl(control);
  }

  removeControl(controlName: string | number) {
    const controlIndex =
      typeof controlName === 'string' ? this.getControlIndex(controlName) : controlName;
    if (controlIndex === undefined) {
      console.error(
        `[Form => removeControl] Cound not find index of '${controlName}' (${typeof controlName}).`,
      );
      return;
    }

    this.formGroup.controls.formArray.removeAt(controlIndex, { emitEvent: false });
  }

  setControlValidators(controlName: string | number, validators: ValidatorFn[]) {
    const controlIndex =
      typeof controlName === 'string' ? this.getControlIndex(controlName) : controlName;
    if (controlIndex === undefined) {
      console.error(
        `[Form => setControlValidators] Could not find index of '${controlName}' (${typeof controlName}).`,
      );
      return;
    }

    const control = this.formGroup.controls.formArray.at(controlIndex);
    control.setValidators(validators);
    this.formGroup.controls.formArray.updateValueAndValidity();
  }

  private outputForm() {
    this.formUpdate.emit(this.formGroup.controls.formArray);
  }

  private getControlIndex(controlName: string | number): number | undefined {
    const controlNames = Object.keys(this.controls);
    const foundIndex = controlNames.findIndex((name) => name === controlName);
    return foundIndex > -1 ? foundIndex : undefined;
  }

  getControlConfig(controlIndex: number) {
    const config = this.config() as FormConfig;

    return config.controls.at(controlIndex);
  }

  setOptionsFor(
    targetName: string,
    newOptions: SelectOption[],
    builderControl: FormControl<unknown>,
  ) {
    const config = this.config();

    const targetSelectIndex = config.controls.findIndex((ctrl) => ctrl.name === targetName) ?? -1;

    if (targetSelectIndex === -1) {
      console.error(
        `[Form => setOptionsFor] Could not find target control for name ${targetName}.`,
      );
      return;
    }

    const targetSelect = config.controls.at(targetSelectIndex) as
      | SelectControl
      | MultiSelectControl;

    isWritableSignal(targetSelect.options)
      ? targetSelect.options.set(newOptions)
      : (targetSelect.options = newOptions);

    builderControl.setValue(newOptions);

    const selectControl = this.controls.at(targetSelectIndex) as FormControl;

    newOptions.length > 0 ? selectControl.enable() : selectControl.disable();

    this.cd.detectChanges();
  }

  getConfigAsSelect(control: Control) {
    return control as SelectControl;
  }

  getConfigAsSelectBuilder(control: Control) {
    return control as SelectBuilderControl;
  }

  getConfigAsMultiSelect(control: Control) {
    return control as MultiSelectControl;
  }

  get value() {
    const ctrls = this.config()?.controls;
    const valueObj: { [x: string | number]: unknown } = {};
    const formArray = this.formGroup.controls.formArray;

    if (ctrls)
      formArray.controls.forEach((control, i) => {
        const ctrl = ctrls[i] as Control;
        if (ctrl) valueObj[ctrl.name] = control.value;
      });

    return valueObj;
  }

  get controls() {
    return this.formGroup.controls.formArray.controls;
  }

  clear() {
    this.formGroup.controls.formArray.clear();
  }

  reset() {
    this.formGroup.controls.formArray.reset();
    this.controls.forEach((control, i) => {
      const matchingCtrl = this.config().controls.at(i);

      if (!matchingCtrl)
        return console.error(`[Form => reset] Could not find type Control at index ${i}`);

      if (matchingCtrl instanceof MultiSelectControl)
        return this.resetMultiSelect(control, matchingCtrl);
      if (matchingCtrl instanceof SelectControl) return this.resetSelect(control, matchingCtrl);
      if (matchingCtrl instanceof Control) return this.resetControl(control, matchingCtrl);
    });

    this.resetForm.emit();
  }

  resetMultiSelect(control: FormControl, ctrl: MultiSelectControl) {
    const ctrlRef = this.multiselects?.find((select) => select.control().name === ctrl.name);

    if (!ctrlRef)
      return console.error(
        `[Form => reset] Could not find MultiSelectControl ref with matching name ${ctrl.name}`,
      );

    ctrlRef.reset();
    control.setValue(ctrl.initialValue, { emitEvent: false });
  }

  resetSelect(control: FormControl, ctrl: SelectControl) {
    const ctrlRef = this.selects?.find((select) => select.control().name === ctrl.name);

    if (!ctrlRef)
      return console.error(
        `[Form => reset] Could not find SelectControl ref with matching name ${ctrl.name}`,
      );

    ctrlRef.textBox.textBox!.nativeElement.innerText = ctrl.initialValue
      ? String(ctrl.initialValue.displayValue ?? ctrl.initialValue.value)
      : '';

    control.setValue(ctrl.initialValue, { emitEvent: false });
    ctrl.initialValue ? ctrlRef.selectOption(ctrl.initialValue, false) : ctrlRef.reset();
  }

  resetControl(control: FormControl, ctrl: Control) {
    const ctrlRef = this.textboxes?.find((box) => box.control().name === ctrl.name);

    if (!ctrlRef)
      return console.error(
        `[Form => reset] Could not find Control ref with matching name ${ctrl.name}`,
      );

    ctrlRef.textBox!.nativeElement.innerText = ctrl.initialValue ? String(ctrl.initialValue) : '';

    control.setValue(ctrl.initialValue, { emitEvent: false });
    ctrl.initialValue ? ctrlRef.updateValue(false) : ctrlRef.clear();
  }
}
