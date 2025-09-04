import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    // canMatch: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // DEMOS PARA VISUALIZAR LOS COMPONENTES Y PAGINAS

  {
    path: 'home',
    loadComponent: () => import('./page/home/home.page').then( m => m.HomePage)
  }

];
