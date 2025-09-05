import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, switchMap, take } from 'rxjs/operators';

// Ionic
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonText, IonNote
} from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { AuthState } from 'src/app/core/services/auth/auth.state';


// Tus servicios (ajusta la ruta si cambia en tu móvil)

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonText, IonNote
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [TabBarComponent, FooterComponent],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private authState = inject(AuthState);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  loading = false;

  formLogin: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  getErrorMessage(field: string): string {
    const control = this.formLogin.get(field);
    if (control?.hasError('required')) {
      return `${field === 'email' ? 'Correo electrónico' : 'Contraseña'} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'medium' = 'medium') {
    const t = await this.toastCtrl.create({ message, duration: 1800, color, position: 'top' });
    await t.present();
  }

  async login() {
    if (this.formLogin.invalid || this.loading) return;

    const objeto = {
      email: this.formLogin.value.email!,
      password: this.formLogin.value.password!,
    };

    this.loading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'circles',
    });
    await loading.present();

    this.auth.Login(objeto).pipe(
      take(1),
      switchMap(() => this.authState.loadMe()),
      finalize(async () => {
        this.loading = false;
        await loading.dismiss();
      })
    ).subscribe({
      next: async (me) => {
        if (!me) {
          await this.presentToast('No se pudo cargar tu sesión. Intenta nuevamente.', 'danger');
          return;
        }
        await this.presentToast('Inicio de sesión exitoso.', 'success');
        this.router.navigateByUrl('/home/inicio');
      },
      error: async (err) => {
        const msg = err?.status === 401
          ? 'Credenciales inválidas.'
          : err?.error?.message || 'No se pudo iniciar sesión.';
        await this.presentToast(msg, 'danger');
      }
    });
  }

  // (Opcional) Tal cual tu método me(), por si quieres probar el endpoint protegido
  me() {
    this.auth.GetMe().subscribe({
      next: (data) => console.log(data),
      error: (err) => this.presentToast(err?.message || 'Error consultando perfil', 'danger'),
    });
  }
}
