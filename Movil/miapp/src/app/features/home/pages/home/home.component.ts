import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from 'src/app/shared/components/sidebar/sidebar.component';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter, IonMenu } from '@ionic/angular/standalone';
import { FooterComponent } from 'src/app/shared/components/footer/footer/footer.component';
import { CarruselComponent } from "src/app/shared/components/carrusel/carrusel/carrusel.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonFooter,
    SidebarComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    FooterComponent, IonMenu, CarruselComponent]
})
export class HomeComponent {

  @ViewChild(CarruselComponent) carrusel!: CarruselComponent;
  @ViewChild(IonMenu) menu!: IonMenu;

  onMenuClose() {
    setTimeout(() => this.carrusel?.updateSwiper(), 200); // espera un poco para recalcular
  }

}
