import { FavoriteFacadeService } from 'src/app/shared/services/favorite/favorite-facade';
import { IfLoggedInDirective } from './../../../../../core/directives/if-logged-in.directive';
import { ProductSelectModel } from 'src/app/shared/models/product/product.model';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, IonicModule, IfLoggedInDirective,],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  private fav = inject(FavoriteFacadeService);
  router = inject(Router);

  @Input({ required: true }) product!: ProductSelectModel;
  @Input() showActions = false;
  @Input() showFavorite = false;

  @Output() edit = new EventEmitter<ProductSelectModel>();
  @Output() delete = new EventEmitter<ProductSelectModel>();

  private readonly placeholder = 'assets/img/cargaImagen.png';

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

  onFavoriteClick(ev: Event) {
    ev.stopPropagation();
    this.fav.toggle(this.product).subscribe({
      next: (isFav) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          timer: 1500,
          showConfirmButton: false,
          icon: 'success',
          title: isFav ? 'Añadido a favoritos' : 'Quitado de favoritos'
        });
      },
      error: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
          icon: 'error',
          title: 'No se pudo actualizar el favorito'
        });
      }
    });
  }
}
