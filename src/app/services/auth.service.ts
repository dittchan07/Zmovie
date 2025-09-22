import { Injectable, inject, NgZone } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { DocumentReference, DocumentData } from 'firebase/firestore';

import { BehaviorSubject, from, Observable } from 'rxjs';
import { AppUser } from '../models/app-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  private userSubject = new BehaviorSubject<AppUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    try {
      const cachedUser = sessionStorage.getItem('user');
      if (cachedUser) {
        this.userSubject.next(JSON.parse(cachedUser));
      }
    } catch {
      console.warn('⚠️ Session user corrupted, clearing cache.');
      sessionStorage.removeItem('user');
    }

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      this.ngZone.run(async () => {
        if (firebaseUser) {
          const userData = await this.getUserData(firebaseUser);
          this.userSubject.next(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
          this.userSubject.next(null);
          sessionStorage.removeItem('user');
        }
      });
    });
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<{ success: boolean; message: string; user: AppUser | null }> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async (cred) => {
          const userRef: DocumentReference<DocumentData> = doc(this.firestore, `users/${cred.user.uid}`);

          const newUser: AppUser = {
            uid: cred.user.uid,
            name: name || cred.user.displayName || cred.user.email || 'Anonim',
            email: cred.user.email || email,
            role: 'user'
          };

          await setDoc(userRef, newUser, { merge: true });
          sessionStorage.setItem('user', JSON.stringify(newUser));
          this.userSubject.next(newUser);

          return { success: true, message: 'Registrasi berhasil!', user: newUser };
        })
        .catch((err) => {
          return { success: false, message: err.message, user: null };
        })
    );
  }

  login(
    email: string,
    password: string
  ): Observable<{ success: boolean; message: string; user: AppUser | null }> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
        .then(async (cred) => {
          const userData = await this.getUserData(cred.user);
          this.userSubject.next(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
          return { success: true, message: 'Login berhasil!', user: userData };
        })
        .catch((err) => {
          return { success: false, message: err.message, user: null };
        })
    );
  }

  logout(): Observable<void> {
    return from(
      this.ngZone.run(() =>
        signOut(this.auth).then(() => {
          sessionStorage.removeItem('user');
          this.userSubject.next(null);
        })
      )
    );
  }

  private async getUserData(user: User): Promise<AppUser> {
    const userRef: DocumentReference<DocumentData> = doc(this.firestore, `users/${user.uid}`);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as AppUser;
      return {
        uid: data.uid,
        email: data.email,
        role: data.role || 'user',
        name: data.name || user.displayName || user.email || 'Anonim'
      };
    }

    const defaultUser: AppUser = {
      uid: user.uid,
      email: user.email || '',
      role: 'user',
      name: user.displayName || user.email || 'Anonim'
    };

    await setDoc(userRef, defaultUser, { merge: true });
    return defaultUser;
  }
}
