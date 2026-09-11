import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

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
    RouterLink,
  ],
})
export class EmailverificationPage implements OnInit {
  constructor() {}

  ngOnInit() {
    console.log('Hello World');
  }
}
