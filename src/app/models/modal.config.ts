import { ComponentRef } from '@angular/core';
import { ModalComponent } from '../components/modal/modal.component';

export class ModalConfig {
  hasCloseButton? = true;
  hasBackdrop? = true;
  hostSelector?: Element | null;
  customClose?: Function;

  /**
   * generated, do not use
   */
  modalRef?: ComponentRef<ModalComponent>;
  /**
   * generated, do not use
   */
  backdropEl?: HTMLDivElement;

  constructor(config?: ModalConfig) {
    Object.assign(this, config);
  }
}
