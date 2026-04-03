import { ComponentRef } from '@angular/core';
import { ModalComponent } from '../components/modal/modal.component';

export class ModalConfig {
  hasCloseButton? = true;
  hasBackdrop? = true;
  hostSelector? = 'app-root';
  customClose?: Function;

  modalRef?: ComponentRef<ModalComponent>;
  backdropEl?: HTMLDivElement;

  constructor(config?: ModalConfig) {
    Object.assign(this, config);
  }
}
