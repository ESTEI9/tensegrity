import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  Injector,
  input,
  isWritableSignal,
  OnChanges,
  output,
  SimpleChanges,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { Textbox } from '../textbox/textbox';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Control, SelectControl, SelectOption } from '../../../models';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-select',
  imports: [Textbox, ReactiveFormsModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: Select,
    },
  ],
  host: {
    '[attr.disabled]': 'disabled',
  },
})
export class Select implements OnChanges, ControlValueAccessor {
  control = input.required<SelectControl>();
  formDisabled = input<boolean>(false, { alias: 'disabled' });
  options = input<SelectOption[]>([]);
  select = output<SelectOption>();

  @ViewChild(Textbox) textBox!: Textbox;

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  protected textControl = new Control({ name: 'selectText' });
  protected listOpen = false;
  protected initialOptions: SelectOption[] = [];
  protected filteredOptions: SelectOption[] = [];
  protected textValue: string | undefined;
  protected optionsListener: Subscription | undefined;
  value: SelectOption | undefined;
  disabled = false;

  private onChange = (option: SelectOption | undefined) => {};
  private onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    const options = changes['options']?.currentValue as SelectOption[] | undefined;
    const control = changes['control']?.currentValue as SelectControl | undefined;
    const formDisabled = changes['formDisabled']?.currentValue as boolean;

    this.disabled = !!formDisabled;

    if (options) {
      this.initialOptions = this.options();
      this.filteredOptions = this.initialOptions;
    }

    if (!options && control) {
      if (isWritableSignal(control.options)) {
        this.optionsListener?.unsubscribe();
        this.optionsListener = this.initialOptionsListener();
      } else {
        this.initialOptions = control.options;
        this.filteredOptions = control.options;
        // must assign AfterViewInit
        setTimeout(() => {
          if (control.initialValue) this.selectOption(control.initialValue);
        }, 1);
      }
    }
  }

  initialOptionsListener() {
    const control = this.control();

    return toObservable(control.options as WritableSignal<SelectOption[]>, {
      injector: this.injector,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((options) => {
          this.initialOptions = options;
          this.filteredOptions = options;
        }),
      )
      .subscribe();
  }

  searchList(text: string | undefined) {
    this.filteredOptions =
      !text || text.length === 0 ? this.initialOptions : this.getFilteredOptions(text);
  }

  getFilteredOptions(text: string) {
    // TODO: update search to include partial matches
    return this.initialOptions.filter((option) =>
      String(option.displayValue ?? option.value)
        .toLowerCase()
        .includes(text.toLowerCase()),
    );
  }

  selectOption(option: SelectOption, emitSelect = true) {
    this.writeValue(option, emitSelect);
    this.textValue = String(option.displayValue ?? option.value ?? '');
    this.textBox.textBox!.nativeElement.innerText = this.textValue;
    this.listOpen = false;
  }

  writeValue(option: SelectOption, emitSelect = true): void {
    this.value = option;
    if (emitSelect) this.select.emit(option);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  reset() {
    const initialValue = this.control().initialValue;
    if (initialValue) {
      this.selectOption(initialValue, false);
      return;
    }

    this.value = undefined;
    this.textValue = '';
    this.textBox.textBox!.nativeElement.innerText = '';
    this.listOpen = false;
  }

  @HostListener('window:click', ['$event.target'])
  clickListener(target: EventTarget | null) {
    // if current target is not in select, close list
    const targetEl = target as HTMLElement;
    const inSelectList = !!targetEl.closest('.select-list');
    const inTextBox = targetEl.closest('.text-box') === this.textBox.textBox?.nativeElement;

    if (!(inSelectList || inTextBox)) {
      this.listOpen = false;
      this.filteredOptions = this.initialOptions;
    }
  }
}
