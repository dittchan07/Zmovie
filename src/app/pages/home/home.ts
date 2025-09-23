import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilmService } from '../../services/film.service';
import { AuthService } from '../../services/auth.service';
import { Film } from '../../models/film.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  films: Film[] = [];
  isLoading = true;
  errorMsg = '';
  private filmSub?: Subscription;

  searchTerm: string = '';
  selectedGenre: string = '';
  genres: string[] = ['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance'];

  sortBy: string = 'rating'; 

  constructor(
    private filmService: FilmService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filmSub = this.filmService.getPublishedFilms().subscribe({
      next: (data) => {
        this.films = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error ambil published films:', err);
        this.errorMsg = 'Gagal memuat data film';
        this.isLoading = false;
      }
    });
  }

  get filteredFilms(): Film[] {
    let result = this.films.filter(f => {
      const matchTitle = f.title?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchGenre = this.selectedGenre ? f.genre === this.selectedGenre : true;
      return matchTitle && matchGenre;
    });

    if (this.sortBy === 'rating') {
      result = result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.sortBy === 'year') {
      result = result.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (this.sortBy === 'title') {
      result = result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }

  goToDetail(id?: string): void {
    if (id) {
      this.router.navigate(['/movie', id]);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error('❌ Error saat logout:', err)
    });
  }

  ngOnDestroy(): void {
    this.filmSub?.unsubscribe();
  }
}
