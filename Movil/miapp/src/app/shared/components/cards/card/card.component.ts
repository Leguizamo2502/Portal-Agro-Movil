import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ProductSelectModel } from '../../../models/product/product.model';
import { Router } from '@angular/router';
import { FavoriteFacadeService } from '../../../services/favorite/favorite-facade';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  private fav = inject(FavoriteFacadeService);
  private toastCtrl = inject(ToastController);
  router = inject(Router);

  @Input({ required: true }) product!: ProductSelectModel;
  @Input() showActions = false;
  @Input() showFavorite = false;

  @Output() edit = new EventEmitter<ProductSelectModel>();
  @Output() delete = new EventEmitter<ProductSelectModel>();

  private readonly placeholder = 'assets/cargaImagen.png';

  get imageUrl(): string {
    const url = this.product?.images?.[0]?.imageUrl;
    return url && url.trim() ? url : this.placeholder;
  }

  get disabledFavorite(): boolean {
    return this.fav.isToggling(this.product?.id);
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = this.placeholder;
  }

  onDetail(item: ProductSelectModel) {
    this.router.navigate(['/home/product', item.id]);
  }

  onEditClick(ev: Event) {
    ev.stopPropagation();
    this.edit.emit(this.product);
  }

  onDeleteClick(ev: Event) {
    ev.stopPropagation();
    this.delete.emit(this.product);
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      position: 'top'
    });
    toast.present();
  }

  onFavoriteClick(ev: Event) {
    ev.stopPropagation();
    this.fav.toggle(this.product).subscribe({
      next: (isFav) => {
        this.showToast(isFav ? 'Añadido a favoritos' : 'Quitado de favoritos', 'success');
      },
      error: () => {
        this.showToast('No se pudo actualizar el favorito', 'danger');
      }
    });
  }
}
