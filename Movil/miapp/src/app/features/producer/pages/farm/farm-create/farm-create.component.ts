import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FarmFormComponent } from '../farm-form/farm-form.component';
import { FarmSelectModel } from '../../../../../shared/models/farm/farm.model';

@Component({
  selector: 'app-farm-create',
  standalone: true,
  imports: [CommonModule, IonicModule, FarmFormComponent],
  templateUrl: './farm-create.component.html',
  styleUrls: ['./farm-create.component.scss'],
})
export class FarmCreateComponent {
  onSaved(farm: FarmSelectModel) {
    console.log('Finca guardada', farm);
  }
}
