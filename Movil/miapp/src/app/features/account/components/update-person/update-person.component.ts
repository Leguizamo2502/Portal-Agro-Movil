import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PersonUpdateModel, UserSelectModel } from 'src/app/core/models/user.model';
import { ButtonComponent } from 'src/app/shared/components/button/button/button.component';



@Component({
  selector: 'app-update-person',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './update-person.component.html',
  styleUrls: ['./update-person.component.scss']
})
export class UpdatePersonComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  title = 'Actualizar datos personales';
  person?: UserSelectModel;
  isLoading = false;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    address:   ['', [Validators.required, Validators.minLength(4)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
  });

  get f() { return this.form.controls; }

  async ngOnInit(): Promise<void> {
    this.loadPerson();
  }

  private async toast(message: string, color: 'success'|'danger'|'medium'='success') {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'top', color });
    await t.present();
  }

  private async loadPerson(): Promise<void> {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando…', spinner: 'dots' });
    await loading.present();

    this.auth.GetDataBasic().subscribe({
      next: async (data) => {
        this.person = data;
        this.form.patchValue({
          firstName: data.firstName,
          lastName:  data.lastName,
          address:   data.address,
          phoneNumber: data.phoneNumber,
        });
        this.form.markAsPristine();
        await loading.dismiss();
        this.isLoading = false;
      },
      error: async (err) => {
        await loading.dismiss();
        this.isLoading = false;
        await this.toast(err?.error?.message ?? 'No se pudieron cargar los datos.', 'danger');
      }
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.pristine) {
      await this.toast('No realizaste modificaciones.', 'medium');
      return;
    }

    const dto: PersonUpdateModel = this.form.getRawValue() as PersonUpdateModel;

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Guardando…', spinner: 'dots' });
    await loading.present();

    this.auth.UpdatePerson(dto).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.toast('Datos actualizados', 'success');
        this.form.markAsPristine();
        this.router.navigate(['/account/info']);
      },
      error: async (err) => {
        await loading.dismiss();
        this.isLoading = false;
        await this.toast(err?.error?.message ?? 'No se pudo actualizar la información.', 'danger');
      }
    });
  }

  cancel(): void {
    if (this.person) {
      this.form.patchValue({
        firstName: this.person.firstName,
        lastName:  this.person.lastName,
        address:   this.person.address,
        phoneNumber: this.person.phoneNumber,
      });
      this.form.markAsPristine();
    }
    this.router.navigate(['/account/info']);
  }
}
