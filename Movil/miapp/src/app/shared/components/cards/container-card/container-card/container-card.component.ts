import { Component, inject, Input } from '@angular/core';
import { ProductSelectModel } from 'src/app/shared/models/product/product.model';
import { CardComponent } from '../../card/card/card.component';
import { CommonModule } from '@angular/common';
import { FavoriteService } from 'src/app/shared/services/favorite/favorite';
import { IonCardContent, IonContent, IonCardTitle, IonCardHeader, IonCard } from "@ionic/angular/standalone";

@Component({
  selector: 'app-container-card',
  imports: [IonCard, IonCardHeader, IonCardTitle, IonContent, IonCardContent, CardComponent, CommonModule],
  templateUrl: './container-card.component.html',
  styleUrl: './container-card.component.css',
})
export class ContainerCardComponent {
  @Input() title = 'Últimos Agregados';
  @Input() showHeader = true;
  @Input() showFavorite = true; // <- define si el card muestra el botón
  @Input({ required: true }) products: ProductSelectModel[] = [];

  trackById = (_: number, p: ProductSelectModel) => p.id;
}
