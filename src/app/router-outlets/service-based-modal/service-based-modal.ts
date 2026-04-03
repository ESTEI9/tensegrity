import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { ModalService } from '../../services/modal';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalConfig } from '../../models';
import { Router } from '@angular/router';
import { Icon } from '../../components/icon/icon';

@Component({
  template: `
    This is some example projected content for the modal. What data do you want to close with?
    <div style="display: flex; flex-direction: column; margin-top: 1rem;">
      <input [(ngModel)]="data" />
      <div style="display: flex; justify-content: center;">
        <button class="primary" style="margin-right: 1rem" (click)="sendData()">
          Send Data Now!
        </button>
        <button class="reset" (click)="closeModal()">Close Modal with Data</button>
      </div>
    </div>
  `,
  imports: [FormsModule],
  styles: `
    :host {
      padding: 0 1rem;
      display: block;
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
  selector: 'app-service-based-modal',
  imports: [FormsModule, CommonModule, Icon],
  templateUrl: './service-based-modal.html',
  styleUrl: './service-based-modal.scss',
})
export class ServiceBasedModal {
  private modalService = inject(ModalService);
  modalRef: ModalComponent | undefined;
  closeMsg: string = '';

  private cd = inject(ChangeDetectorRef);
  protected router = inject(Router);

  open() {
    this.modalRef = this.modalService.open(
      ExampleComponent,
      new ModalConfig({
        hostSelector: '#modalContainer',
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
