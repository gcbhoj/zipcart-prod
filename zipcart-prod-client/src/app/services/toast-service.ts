import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  STANDARD_TIME = 3000; // 3 SECONDS

  private toastController = inject(ToastController);

  async presentSTDToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: this.STANDARD_TIME,
      position: `top`,
    });

    await toast.present();
  }
}
