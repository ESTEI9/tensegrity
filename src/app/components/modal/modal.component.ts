import {
  AfterViewInit,
  Component,
  ComponentRef,
  input,
  OnDestroy,
  output,
  OutputEmitterRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Context } from '../context/context';
import { ModalConfig } from '../../models';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  imports: [Context, Icon],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnDestroy {
  config = input.required<ModalConfig>();
  component = input.required<Type<unknown>>();
  afterClose = output<unknown>();
  outputs = output<{ type: string; event: unknown }>();

  private data: unknown;

  close(data?: unknown) {
    const config = this.config();
    if (data) this.data = data;

    config.customClose ? config.customClose(data) : this.destroy();
  }

  private destroy() {
    const config = this.config();
    config.modalRef!.destroy();
    config.backdropEl!.remove();
  }

  protected refHandler(componentRef: ComponentRef<Type<unknown>>) {
    // for handling modal in internal component
    componentRef.setInput('modal', this.config().modalRef!.instance);
    this.outputHandler(componentRef.instance);
  }

  protected outputHandler(component: Type<unknown>) {
    Object.entries(component)
      .filter(([_prop, value]) => {
        return value instanceof OutputEmitterRef;
      })
      .forEach(([type, signal]) => {
        (signal as OutputEmitterRef<unknown>).subscribe((event) => {
          this.outputs.emit({ type, event });
        });
      });
  }

  ngOnDestroy(): void {
    this.afterClose.emit(this.data);
  }
}
