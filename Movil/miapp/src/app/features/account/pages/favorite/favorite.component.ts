import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';

import { ProductService } from '../../../../shared/services/product/product.service';
import { FavoriteFacadeService } from '../../../../shared/services/favorite/favorite-facade.service';
import { ProductSelectModel } from '../../../../shared/models/product/product.model';


import { Subject, takeUntil } from 'rxjs';
import { ContainerCardFlexComponent } from 'src/app/shared/components/cards/container-card-flex/container-card-flex/container-card-flex.component';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule, IonicModule, ContainerCardFlexComponent],
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private favFacade = inject(FavoriteFacadeService);
  private destroy$ = new Subject<void>();

  loading = false;
  products: ProductSelectModel[] = [];

  ngOnInit(): void {
    this.loadFavorites();

    // Sincroniza cuando cambie un favorito en cualquier parte de la app
    this.favFacade.changes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id, isFavorite }) => {
        if (!isFavorite) {
          this.products = this.products.filter(p => p.id !== id);
        } else {
          // Si lo marcaron como favorito fuera de esta vista, puedes recargar o buscarlo:
          // this.loadFavorites();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFavorites(): void {
    this.loading = true;
    this.productService.getFavorites().subscribe({
      next: (data) => {
        // Asegura el flag por consistencia con el componente de tarjetas
        this.products = (data ?? []).map(p => ({ ...p, isFavorite: true }));
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      },
    });
  }

  // Handler del pull-to-refresh
  doRefresh(ev: Event): void {
    this.productService.getFavorites().subscribe({
      next: (data) => {
        this.products = (data ?? []).map(p => ({ ...p, isFavorite: true }));
        (ev as RefresherCustomEvent).detail.complete();
      },
      error: () => {
        (ev as RefresherCustomEvent).detail.complete();
      },
    });
  }
}
