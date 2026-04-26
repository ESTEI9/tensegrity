import {
  Component,
  inject,
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
import { Control, SelectBuilderControl, SelectOption } from '../../../models';
import { FormGroupDirective, Validators } from '@angular/forms';
import { Icon } from '../../icon/icon';
import { ModalComponent } from '../../modal/modal.component';
import { ModalService } from '../../../services/modal';

@Component({
  imports: [Textbox],
  template: `
    <app-textbox #value [control]="valueCtrl" (update)="pendingOption.value = $event"></app-textbox>
    <app-textbox
      #displayValue
      [control]="displayValueCtrl"
      (update)="pendingOption.displayValue = $event"
    ></app-textbox>
    <div class="actions">
      <button class="reset" (click)="reset()">Reset</button>
      <button class="primary" [class.disabled]="!pendingOption.value" (click)="addItem()">
        Add
      </button>
    </div>
  `,
  styles: `
    :host {
      padding: 1rem;
      display: block;

      .actions {
        display: flex;
        margin-top: 1rem;
        justify-content: flex-end;
      }
    }
  `,
  providers: [FormGroupDirective],
})
class ChipForm {
  modal = input<ModalComponent>();

  @ViewChild('value') valueBox!: Textbox;
  @ViewChild('displayValue') displayValueBox!: Textbox;

  pendingOption = {} as SelectOption;

  protected valueCtrl = new Control({
    name: 'value',
    label: 'Value',
    validators: [Validators.required],
  });

  protected displayValueCtrl = new Control({
    name: 'displayValue',
    label: 'Display Value',
  });

  addItem() {
    this.modal()?.close(this.pendingOption);
  }

  reset() {
    this.pendingOption = {} as SelectOption;
    this.valueBox.clear();
    this.displayValueBox.clear();
  }
}

@Component({
  selector: 'app-select-builder',
  imports: [Chip, Icon],
  templateUrl: './select-builder.html',
  styleUrl: './select-builder.scss',
})
export class SelectBuilder implements OnInit, OnChanges, OnDestroy {
  control = input<SelectBuilderControl>();
  presetOptions = input<SelectOption[]>();
  setOptions = output<SelectOption[]>({ alias: 'options' });

  private modalService = inject(ModalService);

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
    const modalRef = this.modalService.open(ChipForm, {
      hostSelector: document.querySelector('.outlet'),
    });
    modalRef.afterClose.subscribe((value) => {
      if (!value) return;

      const newOption = value as SelectOption;

      if (!this.options.has(String(newOption.value))) {
        this.options.set(String(newOption.value), newOption);
        this.setOptions.emit(Array.from(this.options.values()));
      }
    });
  }

  ngOnDestroy(): void {
    // remove options for the select dependent on this builder
    this.setOptions.emit([]);
  }
}
