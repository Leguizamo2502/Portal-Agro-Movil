import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';

import { IfLoggedInDirective } from 'src/app/core/directives/if-logged-in.directive';
import { IfLoggedOutDirective } from 'src/app/core/directives/if-logged-out.directive';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SidebarService } from 'src/app/shared/services/sidebar/sidebar.service';
import { AuthState } from 'src/app/core/services/auth/auth.state';

@Component({
  selector: 'app-navbar-bueno',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    IfLoggedInDirective,
    IfLoggedOutDirective
  ],
  templateUrl: './navbar-bueno.component.html',
  styleUrls: ['./navbar-bueno.component.css']
})
export class NavbarBuenoComponent {
  // Inputs para usar <app-button>
  @Input() text: string = '';
  @Input() redirectTo?: string;

  // Servicios inyectados
  private authService = inject(AuthService);
  private ath = inject(AuthState);
  router = inject(Router); // público para usar router.url en la plantilla
  private sidebarService = inject(SidebarService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  // Para mostrar/ocultar el botón del menú en /account
  get isAccountRoute(): boolean {
    return this.router.url.startsWith('/account');
  }

  // Toggle del sidebar
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // Logout usando controles nativos de Ionic
  async logOut(): Promise<void> {
    this.authService.LogOut().subscribe({
      next: async () => {
        this.ath.clear();

        const toast = await this.toastCtrl.create({
          message: 'Has cerrado sesión correctamente',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        this.router.navigate(['auth/login']);
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Error al cerrar sesión',
          message: err?.message || 'Ocurrió un error inesperado',
          buttons: ['OK']
        });
        await alert.present();
      },
      complete: () => console.log('Logout completo'),
    });
  }
}
