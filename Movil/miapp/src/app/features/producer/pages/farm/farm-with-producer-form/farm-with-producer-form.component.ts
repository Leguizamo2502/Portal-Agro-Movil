import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FarmFormComponent } from '../farm-form/farm-form.component';
import { FarmSelectModel } from '../../../../../shared/models/farm/farm.model';

@Component({
  selector: 'app-farm-with-producer-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FarmFormComponent],
  templateUrl: './farm-with-producer-form.component.html',
  styleUrls: ['./farm-with-producer-form.component.scss'],
})
export class FarmWithProducerFormComponent {
  onSaved(farm: FarmSelectModel) {
    console.log('Finca guardada (con productor)', farm);
  }
}
