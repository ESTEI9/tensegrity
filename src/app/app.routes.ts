import { Routes } from '@angular/router';
import { FormGenerator } from './router-outlets/form-generator/form-generator';
import { Home } from './router-outlets/home/home';

export const routes: Routes = [
  {
    path: 'form',
    pathMatch: 'full',
    component: FormGenerator,
    title: 'Form Components',
  },
  {
    path: '',
    pathMatch: 'full',
    component: Home,
  },
];
