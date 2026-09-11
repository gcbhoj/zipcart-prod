import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eye } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    addIcons({ eye });
  }
}
