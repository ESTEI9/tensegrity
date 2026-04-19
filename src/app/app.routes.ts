import { Routes } from '@angular/router';
import { FormGenerator } from './router-outlets/form-generator/form-generator';
import { Home } from './router-outlets/home/home';
import { ContextSetter } from './router-outlets/context-setter/context-setter';
import { ServiceBasedModal } from './router-outlets/service-based-modal/service-based-modal';
import { TabsRouteComponent } from './router-outlets/tabs-route/tabs-route.component';

export const routes: Routes = [
  {
    path: 'form',
    pathMatch: 'full',
    component: FormGenerator,
    title: 'Form Components',
  },
  {
    path: 'context',
    pathMatch: 'full',
    component: ContextSetter,
    title: 'Context',
  },
  {
    path: 'modal',
    pathMatch: 'full',
    component: ServiceBasedModal,
    title: 'Modal',
  },
  {
    path: 'tabs',
    pathMatch: 'full',
    component: TabsRouteComponent,
    title: 'Tabs',
  },
  {
    path: '',
    pathMatch: 'full',
    component: Home,
  },
];
