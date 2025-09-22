import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Film } from '../../models/film.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { Firestore, collection, addDoc, orderBy, collectionData } from '@angular/fire/firestore';
import { query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SafeUrlPipe],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.css']
})
export class MovieDetailComponent implements OnInit {
  @Input() film: Film | null = null;

  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  showModal = false;
  newComment = '';
  comments$?: Observable<any[]>;

  ngOnInit(): void {
    if (this.film?.id) {
      const commentsRef = collection(this.firestore, `films/${this.film.id}/comments`);
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      this.comments$ = collectionData(q, { idField: 'id' });
    }
  }

  async addComment(): Promise<void> {
    if (!this.film?.id || !this.newComment.trim()) return;

    const user = await firstValueFrom(this.authService.user$);
    if (!user) {
      alert('Anda harus login untuk berkomentar.');
      return;
    }

    const commentsRef = collection(this.firestore, `films/${this.film.id}/comments`);
    await addDoc(commentsRef, {
      text: this.newComment.trim(),
      createdAt: serverTimestamp(), 
      userId: user.uid,
      userName: user.name || user.email || 'Anonim'
    });

    this.newComment = '';
  }

  openModal(): void {
    if (this.film?.videoUrl) {
      this.showModal = true;
    } else {
      console.warn('⚠️ Film ini tidak punya videoUrl');
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}
