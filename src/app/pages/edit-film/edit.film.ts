import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmService } from '../../services/film.service';
import { Film } from '../../models/film.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-film',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.film.html'
})
export class EditFilmComponent implements OnInit {
  film: Partial<Film> = {
    id: '',
    title: '',
    description: '',
    year: new Date().getFullYear(),
    poster: '',
    rating: 1,
    videoUrl: '',
    published: false
  };

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filmService: FilmService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.filmService.getFilmById(id).subscribe({
        next: (data) => {
          if (data) {
            this.film = { ...data, id }; 
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Error loading film:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  saveFilm() {
    if (!this.film.id) return;

    this.filmService.updateFilm(this.film.id, this.film).then(() => {
      alert('✅ Film updated successfully!');
      this.router.navigate(['/admin']);
    }).catch((err) => {
      console.error('❌ Error updating film:', err);
      alert('❌ Gagal update film!');
    });
  }

  getSafeUrl(url?: string): SafeResourceUrl {
    if (!url) return '';
    let embedUrl = url;

    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
