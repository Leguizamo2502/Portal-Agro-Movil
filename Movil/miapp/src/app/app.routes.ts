
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./features/home/pages/home/home.component').then((m) => m.HomeComponent)
  },
 

];
