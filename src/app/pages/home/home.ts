import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilmService } from '../../services/film.service';
import { AuthService } from '../../services/auth.service';
import { Film } from '../../models/film.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  films: Film[] = [];
  isLoading = true;
  errorMsg = '';
  private filmSub?: Subscription;

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
