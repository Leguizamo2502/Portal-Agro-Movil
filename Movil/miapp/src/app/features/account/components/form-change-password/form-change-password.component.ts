import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PasswordPolicyService } from 'src/app/shared/services/passwordPolicy/password-policy.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ChangePasswordModel } from 'src/app/core/models/changePassword.model';
import { ButtonComponent } from 'src/app/shared/components/button/button/button.component';





@Component({
  selector: 'app-form-change-password',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './form-change-password.component.html',
  styleUrls: ['./form-change-password.component.scss']
})
export class FormChangePasswordComponent {
  private fb = inject(FormBuilder);
  private policy = inject(PasswordPolicyService);
  private auth = inject(AuthService);
  private router = inject(Router);

  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  title = 'Cambiar Contraseña';

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [this.policy.validator()]],
    confirmNewPassword: ['', Validators.required],
  }, { validators: this.policy.passwordsMatch('newPassword', 'confirmNewPassword') });

  get f() { return this.form.controls; }

  private async toast(message: string, color: 'success'|'danger'|'medium'='success') {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'top', color });
    await t.present();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.f.currentPassword.value === this.f.newPassword.value) {
      const a = await this.alertCtrl.create({
        header: 'Atención',
        message: 'La nueva contraseña no puede ser igual a la actual.',
        buttons: ['OK']
      });
      await a.present();
      return;
    }

    const dto: ChangePasswordModel = {
      currentPassword: this.f.currentPassword.value!,
      newPassword: this.f.newPassword.value!,
    };

    const loading = await this.loadingCtrl.create({ message: 'Actualizando…', spinner: 'dots' });
    await loading.present();

    this.auth.ChangePassword(dto).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.toast('Contraseña actualizada', 'success');
        this.form.reset();
        this.router.navigate(['/account/info']);
      },
      error: async (err) => {
        await loading.dismiss();
        await this.toast(err?.error?.message ?? 'No se pudo cambiar la contraseña.', 'danger');
      }
    });
  }
}
