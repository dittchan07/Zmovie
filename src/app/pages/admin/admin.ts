import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FilmService } from '../../services/film.service';
import { AuthService } from '../../services/auth.service';
import { Film } from '../../models/film.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeUrlPipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  films: Film[] = [];
  filmForm!: FormGroup;
  activeTab: 'list' | 'add' = 'list';
  editingFilmId: string | null = null;
  loading = false;
  errorMsg = '';

  private filmSub?: Subscription;
  filter: 'all' | 'published' = 'all';
  sidebarOpen = false;

  constructor(
    private filmService: FilmService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFilms();
  }

  private initForm(): void {
    this.filmForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      genre: [''],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      poster: [''],
      videoUrl: [''],
      published: [false],
    });
  }

  private getFormData(): Partial<Film> {
    return {
      ...this.filmForm.value,
      year: Number(this.filmForm.value.year) || new Date().getFullYear(),
      rating: Number(this.filmForm.value.rating) || 0,
    };
  }

  loadFilms(): void {
    this.loading = true;
    this.errorMsg = '';
    this.filmSub?.unsubscribe();

    const source =
      this.filter === 'published'
        ? this.filmService.getPublishedFilms()
        : this.filmService.getFilms();

    this.filmSub = source.subscribe({
      next: (data) => {
        this.films = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Firestore error:', err);
        this.errorMsg = 'Gagal memuat data film';
        this.loading = false;
      }
    });
  }

  changeFilter(newFilter: 'all' | 'published') {
    this.filter = newFilter;
    this.loadFilms();
  }

  async onSubmit(): Promise<void> {
    if (this.filmForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    const formData = this.getFormData();

    try {
      if (this.editingFilmId) {
        await this.filmService.updateFilm(this.editingFilmId, formData);
      } else {
        await this.filmService.addFilm(formData as Omit<Film, 'id'>);
      }
      this.cancelEdit();
      this.activeTab = 'list';
    } catch (err) {
      console.error('❌ Error saat menyimpan:', err);
      this.errorMsg = 'Gagal menyimpan film';
    } finally {
      this.loading = false;
    }
  }

  editFilm(film: Film): void {
    if (!film.id) return;
    this.editingFilmId = film.id;
    this.filmForm.patchValue(film);
    this.activeTab = 'add';
  }
  
  cancelEdit(): void {
    this.editingFilmId = null;
    this.filmForm.reset({
      title: '',
      description: '',
      genre: '',
      year: new Date().getFullYear(),
      rating: 0,
      poster: '',
      videoUrl: '',
      published: false,
    });
  }

  async deleteFilm(id: string): Promise<void> {
    if (!id || this.loading) return;
    if (!confirm('Yakin ingin menghapus film ini?')) return;

    this.loading = true;
    try {
      await this.filmService.deleteFilm(id);
    } catch (err) {
      console.error('❌ Error hapus:', err);
      this.errorMsg = 'Gagal menghapus film';
    } finally {
      this.loading = false;
    }
  }

  async togglePublish(film: Film): Promise<void> {
    if (!film.id || this.loading) return;
    this.loading = true;

    try {
      await this.filmService.setPublishStatus(film.id, !film.published);
    } catch (err) {
      console.error('❌ Error toggle publish:', err);
      this.errorMsg = 'Gagal mengubah status publish';
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('❌ Logout error:', err);
        this.errorMsg = 'Gagal logout';
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnDestroy(): void {
    this.filmSub?.unsubscribe();
  }
}
