import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Film } from '../../models/film.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { Firestore, collection, addDoc, orderBy, collectionData, doc, docData } from '@angular/fire/firestore';
import { query, serverTimestamp } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SafeUrlPipe],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.css']
})
export class MovieDetailComponent implements OnInit {
  film$?: Observable<Film | undefined>;
  filmId!: string;

  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  showModal = false;
  newComment = '';
  comments$?: Observable<any[]>;

  @ViewChild('commentList') commentListRef!: ElementRef;

  ngOnInit(): void {
    this.filmId = this.route.snapshot.paramMap.get('id')!;
    if (this.filmId) {
      const filmRef = doc(this.firestore, `films/${this.filmId}`);
      this.film$ = docData(filmRef, { idField: 'id' }) as Observable<Film>;

      const commentsRef = collection(this.firestore, `films/${this.filmId}/comments`);
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      this.comments$ = collectionData(q, { idField: 'id' });
    }
  }

  async addComment(): Promise<void> {
    if (!this.filmId || !this.newComment.trim()) return;

    const user = await firstValueFrom(this.authService.user$);
    if (!user) {
      alert('Anda harus login untuk berkomentar.');
      return;
    }

    const commentsRef = collection(this.firestore, `films/${this.filmId}/comments`);
    await addDoc(commentsRef, {
      text: this.newComment.trim(),
      createdAt: serverTimestamp(),
      userId: user.uid,
      userName: user.name || user.email || 'Anonim'
    });

    this.newComment = '';

    setTimeout(() => {
      if (this.commentListRef) {
        this.commentListRef.nativeElement.scrollTop = 0;
      }
    }, 200);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}
