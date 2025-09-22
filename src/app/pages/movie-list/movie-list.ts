import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Film } from '../../models/film.model';
import { FilmService } from '../../services/film.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css']
})
export class MovieListComponent implements OnInit, OnDestroy {
  films: Film[] = [];
  selectedFilm: Film | null = null;
  isPlaying: boolean = false;
  private subscription: Subscription | null = null;

  constructor(private filmService: FilmService) {}

  ngOnInit(): void {
    
    this.subscription = this.filmService.getFilms().subscribe({
      next: (data) => (this.films = data),
      error: (err) => console.error('Gagal ambil film:', err)
    });
  }

  ngOnDestroy(): void {
    
    this.subscription?.unsubscribe();
  }

  openDetail(film: Film): void {
    this.selectedFilm = film;
    this.isPlaying = false; 
  }

  closeDetail(): void {
    this.selectedFilm = null;
    this.isPlaying = false;
  }

  startPlaying(): void {
    this.isPlaying = true;
  }
}
