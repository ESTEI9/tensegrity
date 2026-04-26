import {
  ApplicationRef,
  Binding,
  Component,
  ComponentRef,
  ContentChild,
  createComponent,
  DirectiveWithBindings,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  Renderer2,
  Signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { ModalConfig } from '../models';
import { ModalComponent } from '../components/modal/modal.component';
import { App } from '../app';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  @ContentChild('app-root') rootEl!: Component;

  private appRef = inject(ApplicationRef);

  open(component: Type<unknown>, config?: ModalConfig) {
    const options: {
      environmentInjector: EnvironmentInjector;
      hostElement?: Element;
      elementInjector?: Injector;
      projectableNodes?: Node[][];
      directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];
      bindings?: Binding[];
    } = { environmentInjector: this.appRef.injector };

    const modalComponentRef = createComponent(ModalComponent, options);
    this.appRef.attachView(modalComponentRef.hostView);

    const hostElement = config?.hostSelector ?? document.querySelector('app-root');

    hostElement!.appendChild((modalComponentRef.hostView as any).rootNodes[0]);

    config = new ModalConfig({
      ...config,
      modalRef: modalComponentRef,
    });

    if (config?.hasBackdrop !== false) {
      const backdropEl = document.createElement('div');
      backdropEl.setAttribute(
        'style',
        `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
        background: rgba(0, 0, 0, 0.3);
        `,
      );
      backdropEl.addEventListener('click', () => {
        modalComponentRef.instance.close();
        backdropEl.remove();
      });
      hostElement!.appendChild(backdropEl);
      config.backdropEl = backdropEl;
    }

    modalComponentRef.setInput('config', config);
    modalComponentRef.setInput('component', component);

    modalComponentRef.changeDetectorRef.detectChanges();

    return modalComponentRef.instance;
  }
}
