import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Control } from '../../../models';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-textbox',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './textbox.html',
  styleUrl: './textbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: Textbox,
    },
    // TODO: Resolve error with validators
    // {
    //   provide: NG_VALIDATORS,
    //   multi: true,
    //   useExisting: Textbox,
    // },
  ],
})
export class Textbox implements OnInit, ControlValueAccessor {
  control = input.required<Control>();
  update = output<string | undefined>();

  @ViewChild('textBox') textBox: ElementRef<HTMLDivElement> | undefined;

  protected parentFormGroup = inject(FormGroupDirective);
  private sanitizer = inject(DomSanitizer);

  protected disabled = false;
  protected value: string | undefined;
  formArray: FormArray<FormControl<unknown>> | undefined;

  private onChange = (text: string) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    if (this.parentFormGroup.form?.contains('formArray')) {
      this.formArray = this.parentFormGroup.form.controls['formArray'] as FormArray<
        FormControl<unknown>
      >;
    }
  }

  updateValue(emitEvent = true) {
    const newText = (this.textBox?.nativeElement as HTMLDivElement).innerText;
    const safeText = this.sanitizer.sanitize(SecurityContext.NONE, newText);
    // trimStart() fixes white space with no observable input
    this.writeValue(safeText?.trimStart() ?? undefined, emitEvent);
  }

  writeValue(text: string | undefined, emitEvent = true): void {
    this.value = text;
    if (emitEvent) this.update.emit(this.value);
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

  clear() {
    this.value = undefined;
    this.textBox!.nativeElement.innerText = '';
  }

  @HostListener('click', ['$event'])
  clickListener(event: Event) {
    // TODO: if updateOn is 'blur', update when current target is not in the text box
  }
}
