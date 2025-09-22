import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
import { UserGuard } from './guards/user-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent),
  },

  {
    path: '',
    canActivate: [AuthGuard, UserGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./pages/movie-list/movie-list').then(
            m => m.MovieListComponent
          ),
      },
      {
        path: 'movie/:id',
        loadComponent: () =>
          import('./pages/movie-detail/movie-detail').then(
            m => m.MovieDetailComponent
          ),
      },
    ],
  },

  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.AdminComponent),
  },
  {
    path: 'admin/film/add',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () =>
      import('./pages/add-film/add.film').then(m => m.AddFilmComponent),
  },
  {
    path: 'admin/film/edit/:id',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () =>
      import('./pages/edit-film/edit.film').then(m => m.EditFilmComponent),
  },

  {
    path: 'not-authorized',
    loadComponent: () =>
      import('./pages/not-authorized/not-authorized').then(
        m => m.NotAuthorizedComponent
      ),
  },

  { path: '**', redirectTo: 'login' },
];
