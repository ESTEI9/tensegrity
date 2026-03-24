import { Routes } from '@angular/router';
import { FormGenerator } from './router-outlets/form-generator/form-generator';

export const routes: Routes = [
    {
        path: 'form', pathMatch: 'full', component: FormGenerator, title: 'Form Components'
    },
    {
        path: '', pathMatch: 'full', redirectTo: 'form'
    }
];
