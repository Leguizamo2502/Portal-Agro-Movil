import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController, AlertController, NavController, IonRouterOutlet } from '@ionic/angular';

import {
  ProductSelectModel, ProductImageSelectModel,
  ProductRegisterModel, ProductUpdateModel, ApiOk,
} from '../../../../../shared/models/product/product.model';
import { ProductService } from '../../../../../shared/services/product/product.service';
import { FarmService } from '../../../../../shared/services/farm/farm.service';
import { CategoryService } from '../../../../parameters/services/category/category.service';
import { FarmSelectModel } from '../../../../../shared/models/farm/farm.model';
import { CategorySelectModel } from '../../../../parameters/models/category/category.model';
import { take } from 'rxjs';

/* ===== Validadores utilitarios ===== */
const notWhiteSpaceValidator = (label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null =>
    (typeof c.value === 'string' && c.value.trim().length === 0)
      ? { whitespace: `${label} no puede estar en blanco.` } : null;

const positiveNumberValidator = (label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (!Number.isFinite(n) || n <= 0) return { positive: `${label} debe ser mayor a 0.` };
    return null;
  };

const positiveIntValidator = (label: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (!Number.isInteger(n) || n <= 0) return { positiveInt: `Debe seleccionar ${label.toLowerCase()} válida.` };
    return null;
  };

const arrayMinLen = (min: number): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const v = c.value as number[] | null | undefined;
    return Array.isArray(v) && v.length >= min ? null : { arrayMinLen: { required: min, actual: (v?.length ?? 0) } };
  };

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productSrv = inject(ProductService);
  private farmService = inject(FarmService);
  private categoryService = inject(CategoryService);

  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private nav = inject(NavController);

  /** Necesario para usar canGoBack() correctamente */
  @ViewChild(IonRouterOutlet, { static: false })
  private routerOutlet?: IonRouterOutlet;

  farms: FarmSelectModel[] = [];
  categories: CategorySelectModel[] = [];

  @Output() saved = new EventEmitter<void>();

  generalGroup!: FormGroup;
  detallesGroup!: FormGroup;

  step = signal<'general' | 'detalles' | 'imagenes'>('general');

  isEdit = false;
  isLoading = false;
  isDragging = false;
  isDeletingImage = false;

  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;

  selectedFiles: File[] = [];
  imagesPreview: string[] = [];
  existingImages: ProductImageSelectModel[] = [];
  imagesToDelete: string[] = [];

  productId?: number;

  get totalImages(): number {
    return this.selectedFiles.length + this.existingImages.length;
  }
  get canAddMore(): boolean {
    return this.totalImages < this.MAX_IMAGES;
  }

  ngOnInit(): void {
    this.initForms();
    this.loadCategories();
    this.loadFarm();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');

      if (idParam) {
        // EDIT
        this.productId = Number(idParam);
        this.isEdit = true;
        this.resetForm();
        this.existingImages = [];
        this.imagesToDelete = [];
        this.selectedFiles = [];
        this.imagesPreview = [];

        const priceCtrl = this.generalGroup.get('price');
        priceCtrl?.clearValidators();
        priceCtrl?.addValidators([Validators.required, positiveNumberValidator('El precio'), Validators.max(1_000_000)]);
        priceCtrl?.updateValueAndValidity({ emitEvent: false });

        const prodCtrl = this.generalGroup.get('production');
        prodCtrl?.clearValidators();
        prodCtrl?.addValidators([Validators.required, Validators.maxLength(50), notWhiteSpaceValidator('El tipo de producción')]);
        prodCtrl?.updateValueAndValidity({ emitEvent: false });

        this.loadProduct(this.productId);
      } else {
        // CREATE
        this.productId = undefined;
        this.isEdit = false;
        this.resetForm();
        this.existingImages = [];
        this.imagesToDelete = [];
        this.selectedFiles = [];
        this.imagesPreview = [];

        const priceCtrl = this.generalGroup.get('price');
        priceCtrl?.clearValidators();
        priceCtrl?.addValidators([Validators.required, positiveNumberValidator('El precio'), Validators.max(100_000_000)]);
        priceCtrl?.updateValueAndValidity({ emitEvent: false });

        const prodCtrl = this.generalGroup.get('production');
        prodCtrl?.clearValidators();
        prodCtrl?.addValidators([Validators.required, Validators.maxLength(150), notWhiteSpaceValidator('El tipo de producción')]);
        prodCtrl?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  private initForms(): void {
    this.generalGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), notWhiteSpaceValidator('El nombre')]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500), notWhiteSpaceValidator('La descripción')]],
      price: [null, [Validators.required, Validators.min(0), Validators.max(100_000_000), Validators.pattern(/^\d+$/)]],
      unit: ['', [Validators.required, Validators.maxLength(20), notWhiteSpaceValidator('La unidad')]],
      production: ['', [Validators.required, Validators.maxLength(150), notWhiteSpaceValidator('El tipo de producción')]],
    });

    this.detallesGroup = this.fb.group({
      stock: [0, [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.max(100_000)]],
      status: [true, [Validators.required]],
      categoryId: [null, [Validators.required, positiveIntValidator('Categoría')]],
      farmIds: new FormControl<number[]>([], { nonNullable: true, validators: [arrayMinLen(1)] }),
    });
  }

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

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.productSrv.getById(id).pipe(take(1)).subscribe({
      next: (p) => {
        this.patchFromSelect(p);
        this.existingImages = (p as any).images ?? this.existingImages;
      },
      error: () => { /* deja estado */ },
      complete: () => { this.isLoading = false; }
    });
  }

  private patchFromSelect(p: ProductSelectModel): void {
    this.generalGroup.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      production: p.production,
    });

    const farms = (p.farmIds && p.farmIds.length ? p.farmIds : (p.farmId ? [p.farmId] : []));
    this.detallesGroup.patchValue({
      stock: p.stock,
      status: p.status,
      categoryId: p.categoryId,
      farmIds: farms,
    });
  }

  loadFarm() {
    this.farmService.getByProducer().pipe(take(1)).subscribe((data) => {
      this.farms = data ?? [];
    });
  }
  loadCategories() {
    this.categoryService.getAll().pipe(take(1)).subscribe((data) => {
      this.categories = data ?? [];
    });
  }

  /* ===== Navegación de pasos ===== */
  onStepChange(ev: CustomEvent) {
    const value = (ev.detail as any)?.value as 'general' | 'detalles' | 'imagenes';
    if (!value) return;
    this.step.set(value);
  }
  goNextFromGeneral() {
    this.generalGroup.markAllAsTouched();
    if (this.generalGroup.invalid) return;
    this.step.set('detalles');
  }
  backToGeneral() { this.step.set('general'); }
  goNextFromDetails() {
    this.detallesGroup.markAllAsTouched();
    if (this.detallesGroup.invalid) return;
    this.step.set('imagenes');
  }
  backToDetalles() { this.step.set('detalles'); }
  farmsPlaceholder(): string {
    const len = this.detallesGroup.get('farmIds')?.value?.length || 0;
    return len === 0 ? 'Selecciona al menos una' : `${len} seleccionada(s)`;
  }

  /* ===== Drag & Drop imágenes ===== */
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
    const remaining = this.MAX_IMAGES - this.totalImages;
    if (remaining <= 0) { this.alert('Límite alcanzado', `Máximo ${this.MAX_IMAGES} imágenes`); return; }

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).some((f) => {
      if (!f.type.startsWith('image/')) { errors.push(`"${f.name}" no es una imagen`); return false; }
      if (f.size > this.MAX_FILE_SIZE_BYTES) { errors.push(`"${f.name}" excede ${this.MAX_FILE_SIZE_MB} MB`); return false; }
      if (newFiles.length >= remaining) { return true; }
      newFiles.push(f); return false;
    });

    if (errors.length) this.alert('Archivos inválidos', errors.join('<br/>'));

    this.selectedFiles.push(...newFiles);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => { if ((ev.target as any)?.result) this.imagesPreview.push((ev.target as any).result as string); };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number, isExisting: boolean): void {
    if (this.isDeletingImage) return;

    if (isExisting) {
      const img = this.existingImages[index];
      if (!img?.publicId) { this.existingImages.splice(index, 1); return; }
      // Delegar al UPDATE (enviar imagesToDelete):
      this.imagesToDelete.push(img.publicId);
      this.existingImages.splice(index, 1);
    } else {
      this.selectedFiles.splice(index, 1);
      this.imagesPreview.splice(index, 1);
    }
  }

  /* ===== Guardar ===== */
  async submit(): Promise<void> {
    if (this.isLoading) return;

    this.generalGroup.markAllAsTouched();
    this.detallesGroup.markAllAsTouched();
    if (this.generalGroup.invalid || this.detallesGroup.invalid) return;

    if (this.totalImages > this.MAX_IMAGES) {
      await this.alert('Límite de imágenes', `Máximo ${this.MAX_IMAGES} imágenes en total.`);
      return;
    }
    if (!this.isEdit && this.totalImages === 0) {
      await this.alert('Falta imagen', 'Debes agregar al menos una imagen para crear el producto.');
      return;
    }

    const g = this.generalGroup.value;
    const d = this.detallesGroup.value;

    const base = {
      name: (g.name ?? '').trim(),
      description: (g.description ?? '').trim(),
      price: Number(g.price),
      unit: (g.unit ?? '').trim(),
      production: (g.production ?? '').trim(),
      stock: Number(d.stock),
      status: Boolean(d.status),
      categoryId: Number(d.categoryId),
      farmIds: (d.farmIds as number[]) ?? [],
    };

    const dtoUpdate: ProductUpdateModel = {
      id: this.productId!,
      ...base,
      images: this.selectedFiles.length ? this.selectedFiles : undefined,
      imagesToDelete: this.imagesToDelete.length ? this.imagesToDelete : undefined,
    };

    const dtoCreate: ProductRegisterModel = {
      ...base,
      images: this.selectedFiles.length ? this.selectedFiles : undefined,
    };

    this.isLoading = true;
    const loading = await this.presentLoading(this.isEdit ? 'Actualizando producto…' : 'Creando producto…');

    const request$ = this.isEdit ? this.productSrv.update(dtoUpdate) : this.productSrv.create(dtoCreate);
    request$.pipe(take(1)).subscribe({
      next: async (resp: ApiOk | null) => {
        if (!resp) return;
        const ok = (resp as any).isSuccess ?? (resp as any).IsSuccess;
        if (!ok) return;
        const msg = (resp as any).message ?? (resp as any).Message
          ?? (this.isEdit ? 'Producto actualizado.' : 'Producto creado.');

        await this.toast(msg, 'success');
        this.saved.emit();
        this.resetAfterSave();
        this.router.navigateByUrl('/account/producer/management/product');
      },
      error: async (err) => {
        const msg = err?.error?.message || err?.message ||
          (this.isEdit ? 'No se pudo actualizar el producto.' : 'No se pudo registrar el producto.');
        await this.toast(msg, 'danger');
      },
      complete: async () => {
        this.isLoading = false;
        await loading.dismiss();
      }
    });
  }

  /** Cancelar: usa IonRouterOutlet.canGoBack(); si no hay historial, navega a la ruta segura */
  cancelNav() {
    if (this.routerOutlet?.canGoBack()) {
      this.nav.back();
    } else {
      this.router.navigateByUrl('/account/producer/management/product');
    }
  }

  cancel(): void {
    this.resetForm();
  }
  private resetAfterSave(): void {
    this.isLoading = false;
    this.resetForm();
  }
  private resetForm(): void {
    this.generalGroup.reset();
    this.detallesGroup.reset({ stock: 0, status: true, farmIds: [] });
    this.selectedFiles = [];
    this.imagesPreview = [];
    this.existingImages = this.isEdit ? this.existingImages : [];
    this.imagesToDelete = [];
    this.step.set('general');
  }

  /** Normaliza entradas en tiempo real (ionInput -> detail.value) */
  onInputChange(event: Event, controlName: string): void {
    const ce = event as CustomEvent;
    let value = (ce.detail as any)?.value ?? '';
    if (typeof value !== 'string') value = String(value ?? '');

    if (value.startsWith(' ')) value = value.trimStart();
    if (value.length === 1) value = value.toUpperCase();

    this.generalGroup.get(controlName)?.setValue(value, { emitEvent: false });
  }
}
