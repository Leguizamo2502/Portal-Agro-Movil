import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild, ElementRef } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
register();

@Component({
  selector: 'app-carrusel',
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
  imports: [CommonModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarruselComponent implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperEl!: ElementRef;

  slides = [
    { image: 'assets/backgrounds/descarga.jpg',      title: 'Conectando los Productores de nuestra tierra'},
    { image: 'assets/backgrounds/vacas.jpg', title: 'Del campo a tu mesa, productos frescos y de calidad' },
    { image: 'assets/backgrounds/Wild and beautiful great plains of south dakota a golden landscape with native grasslands and _ Premium AI-generated image.jpg',title: 'Apoyando a los agricultores locales'}
  ];

  ngOnInit() {}

  /** Método para actualizar el swiper */
  updateSwiper() {
    if (this.swiperEl?.nativeElement) {
      this.swiperEl.nativeElement.swiper.update();
    }
  }
}
