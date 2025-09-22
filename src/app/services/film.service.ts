import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  docData,
  collectionData,
  orderBy,
  query
} from '@angular/fire/firestore';
import { CollectionReference, DocumentData, Query, serverTimestamp } from 'firebase/firestore'; 
import { Observable } from 'rxjs';
import { Film } from '../models/film.model';

@Injectable({ providedIn: 'root' })
export class FilmService {
  private firestore = inject(Firestore);
  private filmsRef: CollectionReference<DocumentData>;

  constructor() {
    this.filmsRef = collection(this.firestore, 'films') as CollectionReference<DocumentData>;
  }

  getFilms(): Observable<Film[]> {
    const q: Query<DocumentData> = query(this.filmsRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Film[]>;
  }

  getPublishedFilms(): Observable<Film[]> {
    const q: Query<DocumentData> = query(
      this.filmsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Film[]>;
  }

  getFilmById(id: string): Observable<Film | undefined> {
    const filmDoc = doc(this.firestore, `films/${id}`);
    return docData(filmDoc, { idField: 'id' }) as Observable<Film | undefined>;
  }

  async addFilm(film: Omit<Film, 'id'>): Promise<string> {
    const filmData: any = {
      ...film,
      published: film.published ?? false,
      videoUrl: this.convertYoutubeUrl(film.videoUrl || ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(this.filmsRef, filmData);
    return docRef.id;
  }

  async updateFilm(id: string, film: Partial<Film>): Promise<void> {
    const filmDoc = doc(this.firestore, `films/${id}`);
    const updateData: any = {
      ...film,
      ...(film.videoUrl && { videoUrl: this.convertYoutubeUrl(film.videoUrl) }),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(filmDoc, updateData);
  }

  async deleteFilm(id: string): Promise<void> {
    const filmDoc = doc(this.firestore, `films/${id}`);
    await deleteDoc(filmDoc);
  }

  async setPublishStatus(id: string, status: boolean): Promise<void> {
    const filmDoc = doc(this.firestore, `films/${id}`);
    await updateDoc(filmDoc, {
      published: status,
      updatedAt: serverTimestamp(),
    });
  }

  private convertYoutubeUrl(url: string): string {
    if (!url) return '';
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?youtu\.be\/([^?&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&]+)/,
    ];
    for (const regex of patterns) {
      const match = url.match(regex);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }
}
