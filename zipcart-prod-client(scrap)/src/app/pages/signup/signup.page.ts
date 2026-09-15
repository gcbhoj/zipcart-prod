import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInputPasswordToggle,
} from '@ionic/angular';
import { SignUpCredentials } from '../../DTOs/signUpCredentials';
import { validatePassword, validateEmail } from './verificationManager';
import { Router } from '@angular/router';
import { BackendServices } from '../../services/backend-services';
import { ToastService } from '../../services/toast-service';

import { store } from '../../redux-store/store';
import { setTempToken } from '../../redux-features/emailVerificationSlice';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonInput,
    IonButton,
    IonInputPasswordToggle,
  ],
})
export class SignupPage {
  userInput: SignUpCredentials = {
    emailAddress: '',
    password: '',
  };
  passwordConfirmation: string = '';

  emailErrorText: string = '';
  passwordErrorText: string = '';
  verifyPasswordErrorText: string = '';

  private router = inject(Router);
  private service = inject(BackendServices);
  private toastService = inject(ToastService);
  // registering user
  async registerUser(): Promise<void> {
    if (!this.verifyEmail()) {
      this.emailErrorText = 'Invalid Email. Please enter a valid email address';
      return;
    }

    if (!this.verifyPassword()) {
      this.passwordErrorText =
        'Password must be of minimum 8 characters in length, must contain a symbol and one number';
      return;
    }

    if (!this.verifyBothPasswords()) {
      this.verifyPasswordErrorText = 'Both passwords must match';
      return;
    }

    try {
      const response = await this.service.signUpUser(this.userInput);

      // console.log('Signup response:', response);

      if (response.success) {
        await this.toastService.presentSTDToast(
          'Registration Successful. Redirecting to email verification page',
        );
        if (response.token) {
          store.dispatch(setTempToken(response.token));
        }
        this.cancelFilledForm();
        this.navigateToEmailVerification();
      } else {
        // console.error('Signup failed:', response.message);
        this.toastService.presentSTDToast(
          `Sign up failed\nMessage: response.message`,
        );
      }
    } catch (error) {
      // console.error('Signup request failed:', error);
      this.toastService.presentSTDToast(`Sign up request failed`);
    }
  }

  // cancelling filled form
  cancelFilledForm(): void {
    this.userInput.emailAddress = '';
    this.userInput.password = '';
    this.passwordConfirmation = '';
  }
  //helper functions
  // email verification
  verifyEmail(): boolean {
    const email = this.userInput.emailAddress.trim();

    return validateEmail(email);
  }
  // password verification
  verifyPassword(): boolean {
    return validatePassword(this.userInput.password.trim());
  }
  // password and confirm password verification
  verifyBothPasswords(): boolean {
    return this.userInput.password === this.passwordConfirmation;
  }
  //navigating to emailVerification page
  navigateToEmailVerification(): void {
    this.router.navigate(['/emailverification']);
  }
  navigateToLoginPage(): void {
    this.router.navigate(['/login']);
  }
}
