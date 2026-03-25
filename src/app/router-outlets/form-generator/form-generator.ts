import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Form } from '../../components';
import {
  FormArray,
  FormControl,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Control,
  ControlType,
  ControlTypes,
  FormConfig,
  MultiSelectControl,
  SelectBuilderControl,
  SelectControl,
  SelectOption,
} from '../../models';
import { Select } from '../../components/form-components';
import { shareReplay, tap } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-generator',
  imports: [Form, FormsModule, ReactiveFormsModule, Select, Icon],
  templateUrl: './form-generator.html',
  styleUrl: './form-generator.scss',
  providers: [FormGroupDirective],
})
export class FormGenerator {
  @ViewChild('typeSelect') typeSelect!: Select;
  @ViewChild('configForm') configForm!: Form;
  @ViewChild('outputForm') outputForm!: Form;
  @ViewChild('output') output!: ElementRef<HTMLDivElement>;

  protected router = inject(Router);

  controlTypes = ControlTypes;

  private nameControl = new Control({ name: 'name', label: 'Control Name' });
  private labelControl = new Control({ name: 'label', label: 'Control Label' });

  private textForm = new FormConfig({
    controls: [
      this.nameControl,
      this.labelControl,
      new Control({ name: 'initialValue', label: 'Initial Value' }),
    ],
  });

  protected outputFormConfig = new FormConfig({ controls: [] });

  private selectForm = new FormConfig({
    controls: [
      this.nameControl,
      this.labelControl,
      new SelectBuilderControl({
        name: 'options',
        label: 'Options',
        targetName: 'initialValue',
      }),
      new SelectControl({
        name: 'initialValue',
        label: 'Initial Value',
        options: signal<SelectOption[]>([]),
        disabled: true,
      }),
    ],
  });

  private multiSelectForm = new FormConfig({
    controls: [
      this.nameControl,
      this.labelControl,
      new SelectBuilderControl({
        name: 'options',
        label: 'Options',
        targetName: 'initialValue',
      }),
      new MultiSelectControl({
        name: 'initialValue',
        label: 'Initial Value',
        options: signal<SelectOption[]>([]),
        disabled: true,
      }),
    ],
  });

  protected typeControl: SelectControl;
  protected controlConfig: FormConfig | undefined;
  protected selectedType: ControlType | undefined;
  protected addDisabled = true;
  protected outputValue: string | undefined;

  constructor() {
    this.typeControl = new SelectControl({
      name: 'controlType',
      label: 'Control Type',
      options: ControlTypes.filter((type) => !['select-builder'].includes(type)).map((type) => {
        return {
          value: type,
          displayValue: type
            .split(' ')
            .map((subStr) => subStr[0].toUpperCase() + subStr.slice(1))
            .join(' '),
        };
      }),
    });
  }

  setControlConfig(option: SelectOption) {
    this.controlConfig = this.getControlConfig(option.value as ControlType);
    this.selectedType = String(option.value)
      .split(' ')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ') as ControlType;
  }

  getControlConfig(type: ControlType) {
    switch (type) {
      case 'select':
        return this.selectForm;
      case 'multi-select':
        return this.multiSelectForm;
      default:
        return this.textForm;
    }
  }

  reset() {
    this.typeSelect.reset();
    this.controlConfig = undefined;
    this.addDisabled = true;
  }

  addControl() {
    const controlType = this.typeSelect.value?.value as ControlType;
    const controlParams = Object.values(this.configForm.value);
    const controlName = String(controlParams[0]);
    const label = String(controlParams[1]);

    const newCtrl = (() => {
      switch (controlType) {
        case 'select': {
          const options = controlParams[2] as SelectOption[];
          const initialValue = controlParams[3] as SelectOption | undefined;
          return new SelectControl({ name: controlName, label, options, initialValue });
        }
        case 'multi-select': {
          const options = controlParams[2] as SelectOption[];
          const initialValue = controlParams[3] as SelectOption[] | undefined;
          return new MultiSelectControl({ name: controlName, label, options, initialValue });
        }
        default: {
          const initialValue = controlParams[2];
          return new Control({ name: controlName, label, initialValue });
        }
      }
    })();

    this.outputFormConfig.controls.push(newCtrl);

    this.outputForm.addControl(newCtrl);
    this.reset();
  }

  setFormListener(configFormArray: FormArray) {
    configFormArray.valueChanges
      .pipe(
        shareReplay(),
        tap((values) => {
          const controlType = this.typeSelect.value?.value as ControlType;

          this.addDisabled = (() => {
            if (!controlType) return true;
            if (!values[0]?.length || !values[1]?.length) return true;

            switch (controlType) {
              case 'select':
              case 'multi-select':
                return values.length < 4 || !values[2]?.length;
              default:
                return false;
            }
          })();
        }),
      )
      .subscribe();
  }

  resetForm() {
    this.outputForm.reset();
  }

  clearForm() {
    this.outputForm.clear();
    this.outputValue = undefined;
    this.outputFormConfig = new FormConfig({ controls: [] });
  }

  submitForm() {
    this.outputValue = JSON.stringify(this.outputForm.value, null, 2);
  }
}
