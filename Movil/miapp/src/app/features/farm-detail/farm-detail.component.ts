import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';


import { FarmService } from '../../shared/services/farm/farm.service';
import { FarmSelectModel } from '../../shared/models/farm/farm.model';
import { ButtonComponent } from 'src/app/shared/components/button/button/button.component';

@Component({
  selector: 'app-farm-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, ButtonComponent],
  templateUrl: './farm-detail.component.html',
  styleUrls: ['./farm-detail.component.scss'],
})
export class FarmDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private farmService = inject(FarmService);
  private sanitizer = inject(DomSanitizer);

  private sub?: Subscription;

  farmId!: number;
  farm?: FarmSelectModel;

  loadingFarm = true;
  errorMsg: string | null = null;

  selectedImage: string | null = null;
  mapUrl?: SafeResourceUrl;

  ngOnInit(): void {
    // Lee id desde /:id o ?id=
    const pathId = this.route.snapshot.paramMap.get('id');
    const queryId = this.route.snapshot.queryParamMap.get('id');
    const raw = pathId ?? queryId;
    const parsed = raw != null ? Number(raw) : NaN;

    if (Number.isNaN(parsed)) {
      this.loadingFarm = false;
      this.errorMsg = 'Identificador de finca inválido.';
      return;
    }

    this.farmId = parsed;
    this.loadFarm();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadFarm(): void {
    this.loadingFarm = true;
    this.errorMsg = null;

    this.sub = this.farmService.getById(this.farmId).subscribe({
      next: (f) => {
        this.farm = f;
        this.loadingFarm = false;
        this.selectedImage = f?.images?.[0]?.imageUrl ?? null;

        if (f?.latitude != null && f?.longitude != null) {
          const url = `https://www.google.com/maps?q=${f.latitude},${f.longitude}&z=14&output=embed`;
          this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          this.mapUrl = undefined;
        }
      },
      error: () => {
        this.errorMsg = 'No fue posible cargar la finca. Revisa la conexión con la API.';
        this.loadingFarm = false;
        this.farm = undefined;
        this.mapUrl = undefined;
      },
    });
  }

  changeMainImage(url: string): void {
    this.selectedImage = url;
  }

  get mainImage(): string {
    return this.selectedImage || this.farm?.images?.[0]?.imageUrl || 'img/cargaImagen.png';
  }

  trackByImage = (_: number, img: FarmSelectModel['images'][number]) => img.id;
}
