import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FilmService } from '../../services/film.service';

@Component({
  selector: 'app-add-film',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.film.html',
  styleUrls: ['./add.film.css']
})
export class AddFilmComponent implements OnInit {
  filmForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private filmService: FilmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filmForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      genre: [''],
      year: [new Date().getFullYear(), Validators.required],
      rating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      poster: ['', Validators.required],
      videoUrl: ['', Validators.required],
      published: [false],
    });
  }

  onSubmit(): void {
    if (this.filmForm.valid) {
      this.filmService.addFilm(this.filmForm.value).then(() => {
        alert('✅ Film berhasil ditambahkan!');
        this.router.navigate(['/admin']);
      }).catch(err => {
        console.error('❌ Error tambah film:', err);
      });
    }
  }
}
