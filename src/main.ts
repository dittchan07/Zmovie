// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { AuthGuard } from './app/guards/auth-guard';
import { AdminGuard } from './app/guards/admin-guard';
import { UserGuard } from './app/guards/user-guard';

// Routes
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' as const },

  { path: 'login', loadComponent: () => import('./app/pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./app/pages/register/register').then(m => m.RegisterComponent) },

  {
    path: '',
    canActivate: [AuthGuard, UserGuard],
    children: [
      { path: 'home', loadComponent: () => import('./app/pages/home/home').then(m => m.HomeComponent) },
      { path: 'movies', loadComponent: () => import('./app/pages/movie-list/movie-list').then(m => m.MovieListComponent) },
      { path: 'movie/:id', loadComponent: () => import('./app/pages/movie-detail/movie-detail').then(m => m.MovieDetailComponent) }
    ]
  },

  { path: 'admin', canActivate: [AuthGuard, AdminGuard], loadComponent: () => import('./app/pages/admin/admin').then(m => m.AdminComponent) },
  { path: 'not-authorized', loadComponent: () => import('./app/pages/not-authorized/not-authorized').then(m => m.NotAuthorizedComponent) },
  { path: '**', redirectTo: 'login' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),

    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase);
      console.log('ðŸ”¥ Firebase initialized:', app.name);
      return app;
    }),
    provideFirestore(() => {
      const db = getFirestore();
      console.log('ðŸ“¦ Firestore connected:', db.app.name);
      return db;
    }),
    provideAuth(() => {
      const auth = getAuth();
      console.log('ðŸ”‘ Auth ready:', auth.app.name);
      return auth;
    }),
    provideAnalytics(() => {
      const analytics = getAnalytics();
      console.log('ðŸ“Š Analytics started');
      return analytics;
    }),

    ScreenTrackingService,
    UserTrackingService
  ]
}).catch(err => console.error('âŒ Bootstrap error:', err));

