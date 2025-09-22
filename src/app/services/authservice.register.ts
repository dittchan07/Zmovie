import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { from, Observable, of, map, switchMap, catchError } from 'rxjs';

export interface AppUser {
  uid: string;
  name?: string;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: AppUser | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  register(name: string, email: string, password: string): Observable<{ success: boolean; message: string }> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(cred => {
        const uid = cred.user.uid;
        const userDoc: AppUser = { uid, name, email, role: 'user' };
        return from(setDoc(doc(this.firestore, 'users', uid), userDoc)).pipe(
          map(() => ({ success: true, message: 'Registrasi berhasil! Silakan login.' }))
        );
      }),
      catchError(err => {
        let msg = 'Registrasi gagal! Silakan coba lagi.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'Email sudah terdaftar, coba login atau pakai email lain.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Format email tidak valid.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password terlalu lemah, minimal 6 karakter.';
        }
        return of({ success: false, message: msg });
      })
    );
  }

  
  login(email: string, password: string): Observable<{ success: boolean; message: string }> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(cred => this.fetchUserRole(cred.user.uid)),
      map(user => {
        this.currentUser = { ...user };
        return { success: true, message: `Selamat datang, ${user.name || user.email}!` };
      }),
      catchError(err => {
        let msg = 'Login gagal! Periksa email dan password.';
        if (err.code === 'auth/user-not-found') msg = 'Email belum terdaftar.';
        if (err.code === 'auth/wrong-password') msg = 'Password salah.';
        return of({ success: false, message: msg });
      })
    );
  }


  logout() {
    this.currentUser = null;
    return from(signOut(this.auth)).subscribe(() => this.router.navigate(['/login']));
  }

  private fetchUserRole(uid: string): Observable<AppUser> {
    const docRef = doc(this.firestore, 'users', uid);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        const data = snapshot.data();
        if (!data) throw new Error('User not found');
        return { uid, name: data['name'], email: data['email'], role: data['role'] as 'admin' | 'user' };
      })
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUser?.role === 'user';
  }

  getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  getRole(): 'admin' | 'user' | null {
    return this.currentUser?.role ?? null;
  }
}

