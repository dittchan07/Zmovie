import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  form: FormGroup;
  message = '';
  isError = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  register() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { name, email, password } = this.form.value;

    this.authService.register(name, email, password).subscribe({
      next: (res) => {
        this.isError = !res.success;
        this.message = res.message;
        this.isLoading = false;

        if (res.success) {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isError = true;
        this.message = err.message || 'Registrasi gagal!';
        this.isLoading = false;
      }
    });
  }
}
