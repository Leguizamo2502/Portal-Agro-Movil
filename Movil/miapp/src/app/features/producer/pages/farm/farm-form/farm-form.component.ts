import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FarmSelectModel,
  FarmImageSelectModel,
  FarmUpdateModel,
  FarmWithProducerRegisterModel,
  FarmRegisterModel,
} from '../../../../../shared/models/farm/farm.model';
import {
  DepartmentModel,
  CityModel,
} from '../../../../../shared/models/location/location.model';
import { FarmService } from '../../../../../shared/services/farm/farm.service';
import { LocationService } from '../../../../../shared/services/location/location.service';

import { catchError, finalize, of, take } from 'rxjs';


// Leaflet
import * as L from 'leaflet';
import { ButtonComponent } from 'src/app/shared/components/button/button/button.component';
import { AuthState } from 'src/app/core/services/auth/auth.state';


// ===== Validadores utilitarios =====
const positiveNumberValidator = (label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (!Number.isFinite(n) || n <= 0) return { positive: `${label} debe ser mayor a 0.` };
    return null;
  };

const rangeValidator = (min: number, max: number, label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (!Number.isFinite(n)) return { required: `${label} es obligatorio.` };
    if (n < min || n > max) return { range: `${label} debe estar entre ${min} y ${max}.` };
    return null;
  };

const positiveIntValidator = (label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (!Number.isInteger(n) || n <= 0) return { positiveInt: `Debe seleccionar ${label.toLowerCase()} válida.` };
    return null;
  };

@Component({
  selector: 'app-farm-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './farm-form.component.html',
  styleUrls: ['./farm-form.component.scss'],
})
export class FarmFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private farmSrv = inject(FarmService);
  private locationSrv = inject(LocationService);
  private zone = inject(NgZone);
  private authState = inject(AuthState);

  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  /** Si es true usa createWithProducer (requiere descripción); si es false usa create */
  @Input() createWithProducer = false;

  /** Emite cuando se crea/actualiza */
  @Output() saved = new EventEmitter<FarmSelectModel>();

  // Step control (1..3)
  step: 1 | 2 | 3 = 1;

  // Step groups
  generalGroup!: FormGroup;
  ubicacionGroup!: FormGroup;

  // Estado UI
  isEdit = false;
  isLoading = false;
  isDragging = false;
  isDeletingImage = false;

  // Límites
  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;

  // Imágenes
  selectedFiles: File[] = [];
  imagesPreview: string[] = [];
  existingImages: FarmImageSelectModel[] = [];
  imagesToDelete: string[] = [];

  // Ubicación
  departments: DepartmentModel[] = [];
  cities: CityModel[] = [];

  // Mapa
  @ViewChild('mapContainer', { static: false })
  mapContainer?: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private marker?: L.Marker;
  // Centro por defecto (Huila aprox.)
  private defaultCenter: [number, number] = [2.9386, -75.2519];
  private defaultZoom = 8;

  farmId?: number;

  async ngOnInit(): Promise<void> {
    this.initForms();

    // Validación condicional de 'description'
    const desc = this.generalGroup.get('description');
    desc?.clearValidators();
    if (this.createWithProducer) {
      desc?.addValidators([Validators.required, Validators.minLength(5), Validators.maxLength(500)]);
    } else {
      desc?.addValidators([Validators.maxLength(500)]);
    }
    desc?.updateValueAndValidity({ emitEvent: false });

    this.loadDepartments();

    // Modo edición: lee el id una sola vez
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.farmId = Number(idParam);
      this.isEdit = true;
      this.resetBeforeLoad();
      this.loadFarm(this.farmId);
    } else {
      this.farmId = undefined;
      this.isEdit = false;
      this.resetBeforeLoad();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  /* ============================ INIT FORMS ============================ */
  private initForms(): void {
    this.generalGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      hectares: [null, [Validators.required, positiveNumberValidator('Las hectáreas')]],
      altitude: [null, [Validators.required, Validators.min(0), Validators.max(9000)]],
      description: [''],
    });

    this.ubicacionGroup = this.fb.group({
      departmentId: [null, [Validators.required]],
      cityId: [null, [Validators.required, positiveIntValidator('Ciudad')]],
      latitude: [null, [Validators.required, rangeValidator(-90, 90, 'Latitud')]],
      longitude: [null, [Validators.required, rangeValidator(-180, 180, 'Longitud')]],
    });
  }

  /* ============================ NAV PASOS ============================ */
  goToPrev(): void {
    if (this.step > 1) this.step = (this.step - 1) as 1 | 2 | 3;
  }
  goToNext(): void {
    if (this.step < 3) this.step = (this.step + 1) as 1 | 2 | 3;
    if (this.step === 2) {
      this.zone.runOutsideAngular(() => requestAnimationFrame(() => this.initMap()));
    }
  }
  goToNextFromGeneral(): void {
    this.generalGroup.markAllAsTouched();
    if (this.generalGroup.invalid) return;
    this.goToNext();
  }
  goToNextFromUbicacion(): void {
    this.ubicacionGroup.markAllAsTouched();
    if (this.ubicacionGroup.invalid) return;
    this.goToNext();
  }

  /* ============================ LOAD DATA ============================ */
  private loadFarm(id: number): void {
    this.isLoading = true;
    this.farmSrv
      .getById(id)
      .pipe(take(1))
      .subscribe({
        next: (f) => {
          if (!f) return;
          this.patchFromSelect(f);

          this.existingImages = f.images ?? [];

          const lat = Number(this.ubicacionGroup.value.latitude);
          const lng = Number(this.ubicacionGroup.value.longitude);
          const safeLat = Number.isFinite(lat) ? lat : this.defaultCenter[0];
          const safeLng = Number.isFinite(lng) ? lng : this.defaultCenter[1];
          this.setMarker(safeLat, safeLng, true);
        },
        error: async () => {
          this.isLoading = false;
          await this.alert('Error', 'No se pudo cargar la finca');
        },
        complete: () => (this.isLoading = false),
      });
  }

  private patchFromSelect(f: FarmSelectModel): void {
    this.generalGroup.patchValue({
      name: f.name,
      hectares: f.hectares ?? 0,
      altitude: f.altitude ?? 0,
      description: '',
    });

    this.ubicacionGroup.patchValue({
      departmentId: f.departmentId ?? null,
      cityId: f.cityId ?? null,
      latitude: Number(f.latitude),
      longitude: Number(f.longitude),
    });

    if (f.departmentId) {
      this.onDepartmentChange(f.departmentId, f.cityId);
    }
  }

  private resetBeforeLoad(): void {
    this.generalGroup.reset({ hectares: 0, altitude: 0, description: '' });
    this.ubicacionGroup.reset({
      departmentId: null,
      cityId: null,
      latitude: null,
      longitude: null,
    });
    this.selectedFiles = [];
    this.imagesPreview = [];
    this.existingImages = this.isEdit ? this.existingImages : [];
    this.imagesToDelete = [];
    // Reset marker (si ya hay mapa)
    if (this.map) this.setMarker(this.defaultCenter[0], this.defaultCenter[1], true);
  }

  private loadDepartments(): void {
    this.locationSrv.getDepartment().subscribe({
      next: (deps) => (this.departments = deps),
    });
  }

  onDepartmentChange(depId: number, presetCityId?: number): void {
    this.ubicacionGroup.patchValue({ cityId: null });
    this.cities = [];
    if (!depId) return;

    this.locationSrv.getCity(depId).subscribe({
      next: (cities) => {
        this.cities = cities;
        if (presetCityId && cities.some((c) => c.id === presetCityId)) {
          this.ubicacionGroup.patchValue({ cityId: presetCityId });
        }
      },
    });
  }

  /* ============================ MAPA ============================ */
  private initMap(): void {
    if (!this.mapContainer) return;

    if (this.map) {
      this.map.invalidateSize();
      const lat = Number(this.ubicacionGroup.value.latitude) || this.defaultCenter[0];
      const lng = Number(this.ubicacionGroup.value.longitude) || this.defaultCenter[1];
      this.setMarker(lat, lng, true);
      return;
    }

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });

    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng, true);
      this.ubicacionGroup.patchValue({ latitude: lat, longitude: lng });
    });

    const lat = Number(this.ubicacionGroup.value.latitude) || this.defaultCenter[0];
    const lng = Number(this.ubicacionGroup.value.longitude) || this.defaultCenter[1];
    this.setMarker(lat, lng, false);

    setTimeout(() => this.map!.invalidateSize(), 0);
  }

  private setMarker(lat: number, lng: number, pan = false): void {
    if (!this.map) return;

    if (!this.marker) {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.ubicacionGroup.patchValue({
          latitude: pos.lat,
          longitude: pos.lng,
        });
      });
    } else {
      this.marker.setLatLng([lat, lng]);
    }

    if (pan) {
      this.map.setView([lat, lng], this.map.getZoom(), { animate: true });
    }
  }

  onLatLngManualChange(): void {
    const lat = Number(this.ubicacionGroup.value.latitude);
    const lng = Number(this.ubicacionGroup.value.longitude);
    if (isFinite(lat) && isFinite(lng)) {
      this.setMarker(lat, lng, true);
    }
  }

  /* ============================ DRAG & DROP ============================ */
  onDragOver(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation(); this.isDragging = true;
  }
  onDragLeave(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation(); this.isDragging = false;
  }
  onDropOrInput(files: FileList | null): void {
    this.isDragging = false;
    if (!files?.length) return;
    this.processFiles(files);
  }

  private processFiles(files: FileList): void {
    const total = this.selectedFiles.length + this.existingImages.length;
    const remaining = this.MAX_IMAGES - total;
    if (remaining <= 0) {
      this.toast('Máximo ' + this.MAX_IMAGES + ' imágenes permitidas', 'danger');
      return;
    }

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) {
        errors.push(`"${f.name}" no es una imagen`);
      } else if (f.size > this.MAX_FILE_SIZE_BYTES) {
        errors.push(`"${f.name}" excede ${this.MAX_FILE_SIZE_MB} MB`);
      } else if (newFiles.length < remaining) {
        newFiles.push(f);
      }
    });

    if (errors.length) this.toast(errors.join('\n'), 'danger');

    this.selectedFiles.push(...newFiles);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) this.imagesPreview.push(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number, isExisting: boolean): void {
    if (this.isDeletingImage) return;

    if (isExisting) {
      const img = this.existingImages[index];
      if (!img?.publicId) {
        this.existingImages.splice(index, 1);
        return;
      }
      this.imagesToDelete.push(img.publicId);
      this.existingImages.splice(index, 1);
    } else {
      this.selectedFiles.splice(index, 1);
      this.imagesPreview.splice(index, 1);
    }
  }

  /* ============================ SUBMIT ============================ */
  async submit(): Promise<void> {
    if (this.isLoading) return;

    this.generalGroup.markAllAsTouched();
    this.ubicacionGroup.markAllAsTouched();
    if (this.generalGroup.invalid || this.ubicacionGroup.invalid) return;

    if (!this.isEdit && this.selectedFiles.length === 0) {
      await this.alert('Falta imagen', 'Debes agregar al menos una imagen para crear la finca.');
      return;
    }

    const g = this.generalGroup.value;
    const u = this.ubicacionGroup.value;

    const name = (g.name ?? '').trim();
    const description = (g.description ?? '').trim();
    const hectares = Number(g.hectares);
    const altitude = Number(g.altitude);
    const latitude = Number(u.latitude);
    const longitude = Number(u.longitude);
    const cityId = Number(u.cityId);

    this.isLoading = true;
    const loading = await this.presentLoading(this.isEdit
      ? 'Actualizando finca...'
      : (this.createWithProducer ? 'Creando productor y finca...' : 'Creando finca...'));

    const dtoUpdate: FarmUpdateModel = {
      id: this.farmId!,
      name, hectares, altitude, latitude, longitude, cityId,
      images: this.selectedFiles.length ? this.selectedFiles : undefined,
      imagesToDelete: this.imagesToDelete.length ? this.imagesToDelete : undefined,
    };

    const dtoCreateWithProducer: FarmWithProducerRegisterModel = {
      name, description, hectares, altitude, latitude, longitude, images: this.selectedFiles, cityId,
    };

    const dtoCreate: FarmRegisterModel = {
      name, hectares, altitude, latitude, longitude, images: this.selectedFiles, cityId,
      // producerId: this.authState.me?.producerId // si tu backend lo exige
    };

    const request$ = this.isEdit
      ? this.farmSrv.update(dtoUpdate)
      : (this.createWithProducer ? this.farmSrv.createWithProducer(dtoCreateWithProducer) : this.farmSrv.create(dtoCreate));

    request$
      .pipe(
        take(1),
        catchError((err) => {
          const msg = err?.error?.message || err?.message ||
            (this.isEdit
              ? 'No se pudo actualizar la finca.'
              : (this.createWithProducer ? 'No se pudo crear productor + finca.' : 'No se pudo registrar la finca.'));
          this.toast(msg, 'danger');
          return of(null);
        }),
        finalize(async () => {
          this.isLoading = false;
          await loading.dismiss();
        })
      )
      .subscribe(async (resp) => {
        if (!resp) return;

        if (!this.isEdit && this.createWithProducer) {
          await this.toast('Productor y finca creados', 'success');
          try { await this.authState.reloadMeOnce(); } catch {}
        } else {
          await this.toast(this.isEdit ? 'Finca actualizada' : 'Finca creada', 'success');
        }

        this.saved.emit(resp);
        this.resetAfterSave();
        this.router.navigateByUrl('/account/producer/management/farm');
      });
  }

  cancel(): void {
    this.resetBeforeLoad();
  }

  private resetAfterSave(): void {
    this.isLoading = false;
    this.resetBeforeLoad();
  }

  /* ============================ UI helpers (Ionic) ============================ */
  private async presentLoading(message = 'Por favor espera…') {
    const loading = await this.loadingCtrl.create({ message, spinner: 'dots' });
    await loading.present();
    return loading;
  }
  private async toast(message: string, color: 'success' | 'danger' | 'medium' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'top', color });
    await t.present();
  }
  private async alert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }
}
