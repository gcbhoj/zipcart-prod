import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { Router } from '@angular/router';

import { store } from '../../redux-store/store';

import {
  selectTempToken,
  verifyEmail,
  clearEmailVerification,
} from '../../redux-features/emailVerificationSlice';

import { ToastService } from '../../services/toast-service';
import { BackendServices } from '../../services/backend-services';

@Component({
  selector: 'app-emailverification',
  templateUrl: './emailverification.page.html',
  styleUrls: ['./emailverification.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class EmailverificationPage implements OnInit, OnDestroy {
  tempToken: string | null = selectTempToken(store.getState());

  private router = inject(Router);
  private toastService = inject(ToastService);
  private service = inject(BackendServices);

  private timer: ReturnType<typeof setInterval> | null = null;

  private isVerifying = false;

  ngOnInit(): void {
    this.executeFunction();
  }

  /**
   * Start checking email verification status
   * every 10 seconds.
   */
  executeFunction(): void {
    // Prevent multiple timers from being created
    if (this.timer) {
      return;
    }

    // this.verifyEmailAddress();

    this.timer = setInterval(() => {
      void this.verifyEmailAddress();
    }, 10000);
  }

  /**
   * Resend Email Verification
   */

  async resendEmailVerification(): Promise<void> {
    console.log('Resend Email Verification Clicked');

    this.stopTimer();

    this.tempToken = selectTempToken(store.getState());

    if (!this.tempToken) {
      await this.toastService.presentSTDToast(
        'No email verification token was found.',
      );

      return;
    }

    try {
      await this.service.resendEmailVerification(this.tempToken);

      await this.toastService.presentSTDToast('Verification email sent again.');
    } catch (error) {
      console.error('Resend email verification failed:', error);

      await this.toastService.presentSTDToast(
        'Unable to resend verification email.',
      );
    } finally {
      this.executeFunction();
    }
  }

  /**
   * Check whether the user's email has been verified.
   */
  async verifyEmailAddress(): Promise<void> {
    // Prevent another request if the previous request
    // is still running.
    if (this.isVerifying) {
      return;
    }

    // Get the latest token from Redux.
    this.tempToken = selectTempToken(store.getState());

    if (!this.tempToken) {
      this.stopTimer();

      await this.toastService.presentSTDToast(
        'No email verification token was found.',
      );

      return;
    }

    this.isVerifying = true;

    try {
      const result = await store.dispatch(verifyEmail(this.tempToken));

      if (verifyEmail.fulfilled.match(result)) {
        if (result.payload.emailVerified) {
          this.stopTimer();

          await this.toastService.presentSTDToast(
            'Email verified successfully.',
          );

          store.dispatch(clearEmailVerification());

          this.router.navigate(['/login']);
        }

        // If emailVerified is false,
        // simply wait for the next 10-second check.
        return;
      }

      // The request itself failed.
      // Do not show a toast every 10 seconds.
      console.error('Email verification request failed:', result.payload);
    } catch (error) {
      console.error('Email verification error:', error);
    } finally {
      this.isVerifying = false;
    }
  }

  /**
   * Stop the verification polling timer.
   */
  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Navigate to login manually.
   */
  navigateToLogin(): void {
    this.stopTimer();

    store.dispatch(clearEmailVerification());

    this.router.navigate(['/login']);
  }

  /**
   * Clean up the timer when leaving the page.
   */
  ngOnDestroy(): void {
    this.stopTimer();
  }
}
