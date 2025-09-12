// src/app/shared/components/stat-card/stat-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent {
  /** Nombre del Ionicon (registrado en main.ts con addIcons). Ej: 'time', 'checkmark-circle' */
  @Input() icon: string = 'information-circle';

  /** Texto descriptivo (ej: 'Pedidos Pendientes') */
  @Input() text: string = '';

  /** Cantidad a mostrar */
  @Input() count: number | string = 0;
}
