import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { NgIf, NgForOf, NgTemplateOutlet } from '@angular/common';
import { FarmService } from '../../../../../shared/services/farm/farm.service';
import { FarmSelectModel } from '../../../../../shared/models/farm/farm.model';
import { ContainerCardFlexComponent } from 'src/app/shared/components/cards/container-card-flex/container-card-flex/container-card-flex.component';

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [CommonModule, IonicModule, NgIf, ContainerCardFlexComponent],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss'],
})
export class FarmListComponent implements OnInit {
  private farmService = inject(FarmService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  farms: FarmSelectModel[] = [];

  ngOnInit(): void {
    this.loadFarms();
  }

  trackById = (_: number, f: FarmSelectModel) => f.id;

  loadFarms(): void {
    this.farmService.getByProducer().subscribe(data => (this.farms = data || []));
  }

  onEdit(farm: FarmSelectModel): void {
    this.router.navigate(['/account/producer/management/farm/update', farm.id]);
  }

  async onDelete(farm: FarmSelectModel): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar finca?',
      message: `Se eliminará <strong>${farm.name}</strong>. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.confirmDelete(farm),
        },
      ],
    });
    await alert.present();
  }

  private confirmDelete(farm: FarmSelectModel): void {
    this.farmService.delete(farm.id).subscribe({
      next: async () => {
        this.farms = this.farms.filter(x => x.id !== farm.id);
        const t = await this.toastCtrl.create({
          message: 'Finca eliminada.',
          duration: 1600,
          color: 'success',
          position: 'top',
        });
        await t.present();
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'No se pudo eliminar la finca.',
          duration: 1800,
          color: 'danger',
          position: 'top',
        });
        await t.present();
      },
    });
  }
}
