import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppUser } from '../../models/app-user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  form: FormGroup;
  message = '';
  isError = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,   // ✅ tambahkan FormBuilder
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isError = !res.success;
        this.message = res.message;
        this.isLoading = false;

        if (res.success && res.user) {
          const user: AppUser = res.user;
          sessionStorage.setItem('user', JSON.stringify(user));

          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (err) => {
        this.isError = true;
        this.message = err.message || 'Login gagal!';
        this.isLoading = false;
      }
    });
  }
}
