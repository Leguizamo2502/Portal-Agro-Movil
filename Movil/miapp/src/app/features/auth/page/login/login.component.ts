import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { take, switchMap, finalize } from 'rxjs/operators';

// Ionic (módulo único para componentes Ion)
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';

// Servicios propios
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { AuthState } from 'src/app/core/services/auth/auth.state';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonicModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    if (control?.hasError('email')) return 'Ingrese un correo electrónico válido';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }

  private async toast(message: string, color: 'success' | 'danger' | 'medium' = 'medium') {
    const t = await this.toastCtrl.create({ message, duration: 1800, color, position: 'top' });
    await t.present();
  }

  async login() {
    if (this.formLogin.invalid || this.loading) return;

    const payload = {
      email: this.formLogin.value.email!,
      password: this.formLogin.value.password!,
    };

    this.loading = true;
    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...', spinner: 'circles' });
    await loading.present();

    this.auth.Login(payload).pipe(
      take(1),
      switchMap(() => this.authState.loadMe()),
      finalize(async () => {
        this.loading = false;
        await loading.dismiss();
      })
    ).subscribe({
      next: async (me) => {
        if (!me) {
          await this.toast('No se pudo cargar tu sesión. Intenta nuevamente.', 'danger');
          return;
        }
        await this.toast('Inicio de sesión exitoso.', 'success');
        this.router.navigateByUrl('/home');
      },
      error: async (err) => {
        const msg = err?.status === 401
          ? 'Credenciales inválidas.'
          : err?.error?.message || 'No se pudo iniciar sesión.';
        await this.toast(msg, 'danger');
      }
    });
  }

  // (Opcional) Probar endpoint protegido
  me() {
    this.auth.GetMe().subscribe({
      next: (data) => console.log(data),
      error: (err) => this.toast(err?.message || 'Error consultando perfil', 'danger'),
    });
  }
}
