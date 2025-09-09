import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
register();

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarruselComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperRef', { static: false }) swiperEl!: ElementRef<HTMLElement>;

  slides = [
    { image: 'assets/backgrounds/descarga.jpg', title: 'Conectando los Productores de nuestra tierra' },
    { image: 'assets/backgrounds/vacas.jpg', title: 'Del campo a tu mesa, productos frescos y de calidad' },
    { image: 'assets/backgrounds/Wild and beautiful great plains of south dakota a golden landscape with native grasslands and _ Premium AI-generated image.jpg', title: 'Apoyando a los agricultores locales' }
  ];

  ngOnInit() {}

  ngAfterViewInit(): void {
    // Inicializa el Swiper cuando ya existen los slides en el DOM
    // Usamos rAF para asegurar que Angular haya pintado
    requestAnimationFrame(() => {
      const el: any = this.swiperEl?.nativeElement;
      if (el && typeof el.initialize === 'function') {
        el.initialize();
      }
    });
  }

  updateSwiper() {
    const el: any = this.swiperEl?.nativeElement;
    el?.swiper?.update?.();
  }
}
