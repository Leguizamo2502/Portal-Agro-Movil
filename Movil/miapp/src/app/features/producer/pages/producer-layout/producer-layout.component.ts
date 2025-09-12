import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-producer-layout',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './producer-layout.component.html',
  styleUrls: ['./producer-layout.component.scss'],
})
export class ProducerLayoutComponent {
  private router = inject(Router);
  private route  = inject(ActivatedRoute); // 👈 importante para navegación relativa

  tabs = [
    { label: 'Resumen',   path: 'summary' },
    { label: 'Gestión',   path: 'management' },
  ] as const;

  selected = signal<string>(this.pickTab(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.selected.set(this.pickTab(e.urlAfterRedirects)));
  }

  onSegmentChange(ev: CustomEvent) {
    const value = (ev.detail as any).value as string;
    if (!value) return;
    // 👇 navega al hijo relativo a /producer (este componente)
    this.router.navigate([value], { relativeTo: this.route });
  }

  private pickTab(url: string) {
    return this.tabs.find(t => url.includes('/' + t.path))?.path ?? this.tabs[0].path;
  }
}
