import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserSelectModel } from '../../../../core/models/user.model';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  person?: UserSelectModel;

  ngOnInit(): void {
    this.loadPerson();
  }

  private loadPerson(): void {
    this.authService.GetDataBasic().subscribe({
      next: (data) => (this.person = data),
      error: () => (this.person = undefined),
    });
  }

  async onLogout() {
    try {
      // usa tu método real si se llama distinto
      (this.authService as any)?.LogOut?.();
      const t = await this.toastCtrl.create({ message: 'Sesión cerrada', duration: 1500, position: 'top' });
      await t.present();
      // redirige al login
      location.href = '/auth/login';
    } catch {
      const t = await this.toastCtrl.create({ message: 'No se pudo cerrar sesión', duration: 1500, color: 'danger', position: 'top' });
      await t.present();
    }
  }
}
