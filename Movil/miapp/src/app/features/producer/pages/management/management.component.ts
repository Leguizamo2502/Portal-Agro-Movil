import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute, UrlSegment } from '@angular/router';
import { filter, map, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterOutlet],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  tabs = [
    { label: 'Productos', path: 'product' },
    { label: 'Fincas',    path: 'farm'    },
  ];

  /** valor actual del ion-segment (coincide con el path de la pestaña) */
  segmentValue = this.tabs[0].path;

  ngOnInit(): void {
    // Mantener seleccionado el tab según la URL actual
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        // intenta leer el primer hijo de la ruta actual (/management/<hijo>)
        const firstChild = this.route.firstChild;
        if (firstChild?.snapshot?.url?.length) {
          const seg: UrlSegment = firstChild.snapshot.url[0];
          return seg?.path || this.tabs[0].path;
        }
        return this.tabs[0].path;
      }),
      takeUntil(this.destroy$)
    ).subscribe(val => this.segmentValue = val);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Navega cuando el usuario cambia de pestaña */
  onSegmentChange(ev: CustomEvent) {
    const value = (ev.detail as any)?.value ?? this.tabs[0].path;
    // Navega relativo a /management
    this.router.navigate([value], { relativeTo: this.route });
  }
}
