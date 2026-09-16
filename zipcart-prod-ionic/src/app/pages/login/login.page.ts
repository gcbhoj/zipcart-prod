import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonButton,
  IonInputPasswordToggle,
  IonInput,
} from '@ionic/angular';
import { SignUpCredentials } from '../../DTOs/signUpCredentials';
import { validateEmail, validatePassword } from '../signup/verificationManager';
import { Router } from '@angular/router';

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
    IonItem,
    IonButton,
    IonInputPasswordToggle,
    IonInput,
  ],
})
export class LoginPage implements OnInit {
  userInput: SignUpCredentials = {
    emailAddress: '',
    password: '',
  };
  emailErrorText: string = 'this is error text';
  passwordErrorText: string = '';
  private router = inject(Router);

  ngOnInit() {
    console.log('Hello World From log in');
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
