// app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/layouts/main-layout/main-layout.component';
import { ForbiddenComponent } from './core/pages/forbidden/forbidden.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';


export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./features/home/home.routes').then(m => m.HOME_ROUTES),
      },
      // {
      //   path: 'account',
      //   loadChildren: () =>
      //     import('./features/account/account.routes').then(r => r.ACCOUNT_ROUTES),
      // },
      { path: 'forbidden', component: ForbiddenComponent },
      { path: 'notFound', component: NotFoundComponent },
      // (demos/otros si quieres, igual que en tu Angular)
    ],
  },

  { path: '**', redirectTo: 'notFound' },
];
