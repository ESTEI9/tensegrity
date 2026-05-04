import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ModalService } from '../../services/modal';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalConfig } from '../../models';
import { Subject } from 'rxjs';

@Component({
  template: `
    This is some example projected content for the modal. What data do you want to close with?
    <div style="display: flex; flex-direction: column; margin-top: 1rem;">
      <input [(ngModel)]="data" />
      <div class="modal-actions">
        <button class="primary" (click)="sendData()">Send Data Now!</button>
        <button class="reset" (click)="closeModal()">Close Modal with Data</button>
      </div>
    </div>
  `,
  imports: [FormsModule],
  styles: `
    :host {
      padding: 0 1rem;
      display: block;

      .modal-actions {
        display: flex;
        justify-content: center;
        margin: 1rem 0;
      }

      @media (max-width: 769px) {
        .modal-actions {
          flex-direction: column;

          button {
            margin-left: 0;

            &:not(:first-child) {
              margin-top: 0.5rem;
            }
          }
        }
      }
    }
    input {
      background: var(--white-10);
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      color: var(--text-color);
      border: 1px solid var(--white-20);
      margin-bottom: 1rem;

      &:focus,
      &:focus-within {
        outline: none;
        border-color: var(--blue-50);
      }
    }
  `,
})
class ExampleComponent {
  modal = input.required<ModalComponent>();
  testOutput = output<string | undefined>();

  data: string | undefined;

  sendData() {
    this.testOutput.emit(this.data);
  }

  closeModal() {
    this.modal().close(this.data);
  }
}

@Component({
  selector: 'app-modal-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal.page.html',
  styleUrl: './modal.page.scss',
})
export class ModalPage implements AfterViewInit {
  @ViewChild('documentation') documentation: TemplateRef<unknown> | undefined;
  @ViewChild('configuration') configuration: TemplateRef<unknown> | undefined;
  @ViewChild('output') output: TemplateRef<unknown> | undefined;
  @ViewChild('consoleOutput') consoleOutput: TemplateRef<unknown> | undefined;

  private modalService = inject(ModalService);
  private cd = inject(ChangeDetectorRef);

  afterViewInitHook = new Subject<void>();

  modalRef: ModalComponent | undefined;
  closeMsg: string = '';

  ngAfterViewInit(): void {
    this.afterViewInitHook.next();
  }

  open() {
    this.modalRef = this.modalService.open(
      ExampleComponent,
      new ModalConfig({
        hostSelector: document.getElementById('modalContainer'),
      }),
    );
    this.closeMsg = '';
    this.modalRef.outputs.subscribe((output) => {
      if (output.type === 'testOutput') this.setCloseMsg(output.event as string);
    });
    this.modalRef.afterClose.subscribe((msg) => {
      this.setCloseMsg(msg);
      this.modalRef = undefined;
      this.cd.detectChanges();
    });
  }

  setCloseMsg(msg: unknown) {
    this.closeMsg = msg ? JSON.stringify(this.getFormattedMsg(msg as string), null, 2) : '';

    this.cd.detectChanges();
  }

  getFormattedMsg(msg: string) {
    // remove quotes
    let newMsg = msg.startsWith('"') ? msg.slice(1) : msg;
    newMsg = newMsg.endsWith('"') ? newMsg.slice(0, -1) : newMsg;

    return newMsg;
  }

  close() {
    this.modalRef!.close(this.closeMsg);
  }
}
