import {
  ChangeDetectorRef,
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
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Control, MultiSelectControl, SelectOption } from '../../../models';
import { Subscription, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Textbox } from '../textbox/textbox';
import { Chip } from '../../chip/chip';

@Component({
  selector: 'app-multi-select',
  imports: [Textbox, ReactiveFormsModule, Chip],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MultiSelect,
    },
  ],
  host: {
    '[attr.disabled]': 'disabled',
  },
})
export class MultiSelect implements OnChanges, ControlValueAccessor {
  control = input.required<MultiSelectControl>();
  formDisabled = input<boolean>(false, { alias: 'disabled' });
  options = input<SelectOption[]>([]);
  select = output<SelectOption[]>();

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('searchBox') searchBox!: Textbox;

  protected searchControl = new Control({ name: 'searchValue' });
  protected searchValue = '';
  protected selectedOptions = new Set<SelectOption>();
  protected listOpen = false;
  protected initialOptions: SelectOption[] = [];
  protected filteredOptions: SelectOption[] = [];
  protected optionsListener: Subscription | undefined;
  value: SelectOption[] | undefined;
  disabled = false;

  private onChange = (options: SelectOption[] | undefined) => {};
  private onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    const options = changes['options']?.currentValue as SelectOption[] | undefined;
    const control = changes['control']?.currentValue as MultiSelectControl | undefined;
    const formDisabled = changes['formDisabled']?.currentValue as boolean;

    this.disabled = !!formDisabled;

    if (options) {
      this.initialOptions = this.options();
      setTimeout(() => this.setFilteredOptions());
    }

    if (!options && control) {
      if (control.initialValue) this.selectOptions(control.initialValue);
      if (isWritableSignal(control.options)) {
        this.optionsListener?.unsubscribe();
        this.optionsListener = this.initialOptionsListener();
      } else {
        this.initialOptions = control.options;
        setTimeout(() => this.setFilteredOptions());
      }
    }
  }

  selectOptions(options: SelectOption[]) {
    this.selectedOptions.clear();

    options.forEach((option) => this.selectedOptions.add(option));
    this.writeValue();
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
          setTimeout(() => this.setFilteredOptions());
        }),
      )
      .subscribe();
  }

  selectOption(option: SelectOption) {
    if (this.selectedOptions.has(option)) return;

    this.selectedOptions.add(option);

    setTimeout(() => {
      this.setFilteredOptions();
      this.searchValue = '';
      this.writeValue();
      this.cd.detectChanges();
    });
  }

  setFilteredOptions(text?: string) {
    const selectedOptions = Array.from(this.selectedOptions.values()).map((value) =>
      String(value.value),
    );
    const availableOptions = this.initialOptions.filter(
      (option) => !selectedOptions.includes(String(option.value)),
    );

    this.filteredOptions = text
      ? availableOptions.filter((option) =>
          String(option.displayValue ?? option.value)
            .toLowerCase()
            .includes(text.toLowerCase()),
        )
      : availableOptions;
  }

  writeValue(options?: SelectOption[], emitSelect = true): void {
    this.value = options ?? Array.from(this.selectedOptions.values());
    if (emitSelect) this.select.emit(this.value);
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
    this.searchBox.clear();
    const initialValue = this.control().initialValue;

    if (initialValue) {
      this.selectOptions(initialValue);
    } else {
      this.value = undefined;
      this.searchValue = '';
    }

    this.listOpen = false;
  }

  deselectOption(option: SelectOption) {
    if (!this.selectedOptions.has(option)) return;

    this.selectedOptions.delete(option);

    setTimeout(() => {
      this.setFilteredOptions();
      this.writeValue();
      this.cd.detectChanges();
    });
  }

  @HostListener('window:click', ['$event.target'])
  clickListener(target: EventTarget | null) {
    // if current target is not in select, close list
    const targetEl = target as HTMLElement;
    const inSelect = !!targetEl.closest('app-multi-select');

    if (!inSelect) {
      this.listOpen = false;

      setTimeout(() => {
        this.setFilteredOptions();
        this.cd.detectChanges();
      });
    }
  }
}
