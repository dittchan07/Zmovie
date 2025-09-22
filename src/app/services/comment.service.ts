import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, orderBy, query } from '@angular/fire/firestore';
import { serverTimestamp, CollectionReference, DocumentData } from 'firebase/firestore'; 

import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private firestore: Firestore) {}

  getComments(filmId: string): Observable<Comment[]> {
    const commentsRef = collection(this.firestore, `films/${filmId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  addComment(filmId: string, userId: string, userName: string, text: string) {
    const commentsRef = collection(
      this.firestore,
      `films/${filmId}/comments`
    ) as CollectionReference<DocumentData>;

    return addDoc(commentsRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    });
  }
}
