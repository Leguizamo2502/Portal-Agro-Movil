import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { NgChartsModule } from 'ng2-charts';
import 'chart.js/auto'; // <-- registra todos los tipos de Chart.js

import { ChartConfiguration, ChartOptions } from 'chart.js';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card/stat-card.component';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgChartsModule,        // <-- en vez de BaseChartDirective
    StatCardComponent
  ],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {

  // Datos de ejemplo
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Café', 'Maíz', 'Cacao', 'Frijol', 'Arroz'],
    datasets: [
      {
        label: 'Ventas',
        data: [120, 90, 150, 70, 110],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#29B6F6'], // 5 colores = 5 barras
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  // Opciones del gráfico
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // deja que el alto lo controle el CSS del contenedor
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          color: '#333',
          font: { size: 14, weight: 'bold' }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#333' } },
      y: { beginAtZero: true, ticks: { color: '#333' } }
    }
  };
}
