import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { SignUpCredentials } from '../../DTOs/signUpCredentials';
import { validateEmail, validatePassword } from '../signup/verificationManager';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage implements OnInit {
  userInput: SignUpCredentials = {
    emailAddress: '',
    password: '',
  };

  private router = inject(Router);

  ngOnInit() {
    console.log('Hello world');
  }
  // helper methods
  verifyEmail(): boolean {
    const email = this.userInput.emailAddress.trim();
    return validateEmail(email);
  }
  verifyPassword(): boolean {
    const password = this.userInput.password.trim();
    return validatePassword(password);
  }
}
