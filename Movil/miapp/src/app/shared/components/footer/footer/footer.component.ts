import { Component } from '@angular/core';
import { IonCol, IonRow, IonGrid, IonContent, IonFooter, IonToolbar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [IonCol, IonRow, IonGrid, IonFooter, IonToolbar]
})
export class FooterComponent {
  email: string = "portalagrocomercialhuila@gmail.com";
  location: string = "Neiva, Huila, Colombia";
}
