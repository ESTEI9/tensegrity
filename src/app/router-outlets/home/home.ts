import { NgOptimizedImage } from '@angular/common';
import { Component, Type } from '@angular/core';
import { Context } from '../../components/context/context';
import { FormGenerator } from '../form-generator/form-generator';
import { ContextSetter } from '../context-setter/context-setter';
import { ServiceBasedModal } from '../service-based-modal/service-based-modal';
import { TabsRouteComponent } from '../tabs-route/tabs-route.component';

@Component({
  template: `
    A structural principle using compressed components (which do not touch each other) inside a
    network of continuous tension.
  `,
  styles: `
    :host {
      position: absolute;
      top: 20vh;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      font-family: var(--heading-font);
    }
  `,
})
class StartPage {}

@Component({
  template: `
    <div class="placeholder">
      <h1>404</h1>
      The page you are looking for can't be found.
    </div>
  `,
})
class NotFoundPage {}

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, Context],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected currentRoute: Type<unknown> = StartPage;
  protected stringRoute = 'startPage';
  protected loadingRoute = false;

  public navigate(route: string) {
    this.loadingRoute = true;
    this.stringRoute = route;
    this.currentRoute = (() => {
      switch (route) {
        case 'startPage':
          return StartPage;
        case 'form':
          return FormGenerator;
        case 'context':
          return ContextSetter;
        case 'modal':
          return ServiceBasedModal;
        case 'tabs':
          return TabsRouteComponent;
        default:
          return NotFoundPage;
      }
    })();
  }
}
