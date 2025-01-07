import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  isLoading = true;

  constructor() {
    this.initializeAuthListener();
    this.createAuthForm();
  }

  login() {
    const { email, password } = this.loginForm?.value;
    signInWithEmailAndPassword(this.auth, email, password).then((user) => {
      return this.setUserLoggedIn();
    });
  }

  private initializeAuthListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.setUserLoggedIn();
      } else {
        this.isLoading = false;
      }
    });
  }

  private createAuthForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private setUserLoggedIn() {
    this.authService.isLoggedIn.set(true);
    return this.router.navigate(['/home']);
  }
}
