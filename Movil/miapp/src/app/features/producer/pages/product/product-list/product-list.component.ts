import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';

import { ProductService } from '../../../../../shared/services/product/product.service';
import { ProductSelectModel } from '../../../../../shared/models/product/product.model';

import { take } from 'rxjs';
import { ContainerCardFlexComponent } from 'src/app/shared/components/cards/container-card-flex/container-card-flex/container-card-flex.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, IonicModule, ContainerCardFlexComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Ionic helpers
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  products: ProductSelectModel[] = [];

  ngOnInit(): void {
    this.loadProduct();
  }

  trackById = (_: number, p: ProductSelectModel) => p.id;

  loadProduct(): void {
    this.productService.getByProducerId().pipe(take(1)).subscribe({
      next: (data) => (this.products = data ?? []),
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'No se pudieron cargar los productos.',
          color: 'danger',
          duration: 1800,
          position: 'top',
        });
        await t.present();
      },
    });
  }

  onEdit(p: ProductSelectModel): void {
    this.router.navigate(['/account/producer/management/product/update', p.id]);
  }

  async onDelete(p: ProductSelectModel): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar producto?',
      message: `Se eliminará "<strong>${p.name}</strong>". Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, eliminar',
          role: 'destructive',
          handler: () => this.confirmDelete(p),
        },
      ],
    });
    await alert.present();
  }

  private async confirmDelete(p: ProductSelectModel): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando…', spinner: 'dots' });
    await loading.present();

    this.productService.delete(p.id).pipe(take(1)).subscribe({
      next: async () => {
        this.products = this.products.filter((x) => x.id !== p.id);
        const t = await this.toastCtrl.create({
          message: 'Producto eliminado.',
          color: 'success',
          duration: 1500,
          position: 'top',
        });
        await t.present();
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'No se pudo eliminar el producto.',
          color: 'danger',
          duration: 1800,
          position: 'top',
        });
        await t.present();
      },
      complete: async () => {
        await loading.dismiss();
      },
    });
  }
}
