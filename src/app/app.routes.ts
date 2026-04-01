import { Routes } from '@angular/router';
import { FormGenerator } from './router-outlets/form-generator/form-generator';
import { Home } from './router-outlets/home/home';
import { ContextSetter } from './router-outlets/context-setter/context-setter';

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
    path: '',
    pathMatch: 'full',
    component: Home,
  },
];
