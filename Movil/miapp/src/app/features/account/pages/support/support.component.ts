import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  email = 'portalagrocomercialhuila@gmail.com';
  phone = '+57 310 123 4567';
}
