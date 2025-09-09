// product.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContainerCardFlexComponent } from 'src/app/shared/components/cards/container-card-flex/container-card-flex/container-card-flex.component';
import { ButtonComponent } from 'src/app/shared/components/button/button/button.component';
import { ProductService } from 'src/app/shared/services/product/product.service';
import { ProductSelectModel } from 'src/app/shared/models/product/product.model';
import { CategoryService } from 'src/app/features/parameters/services/category/category.service';
import { CategoryNodeModel } from 'src/app/features/parameters/models/category/category.model';



// Cards


// Modelos


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    ContainerCardFlexComponent,
    ButtonComponent
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  private productService  = inject(ProductService);
  private categoryService = inject(CategoryService);

  products: ProductSelectModel[] = [];
  categories: CategoryNodeModel[] = [];

  breadcrumb: { id: number; name: string }[] = [];
  selectedCategoryId: number | null = null;

  categoryCtrl = new FormControl<number | null>(null, { nonNullable: false });

  // loading
  isLoadingProducts = false;
  isLoadingCategories = false;
  atLeaf = false;

  // paginación (front)
  pageIndex = 0;
  pageSize = 12;
  pageSizeOptions = [8, 12, 24, 48];

  // Total páginas (para los botones de paginación)
  get totalPages(): number {
    return this.pageSize ? Math.ceil((this.products?.length || 0) / this.pageSize) : 1;
  }

  // items visibles (slice)
  get pagedProducts(): ProductSelectModel[] {
    const start = this.pageIndex * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadRootCategories();
    this.loadProductsHome();
  }

  // ---------- Productos ----------
  private loadProductsHome(): void {
    this.isLoadingProducts = true;
    this.productService.getAllHome().subscribe({
      next: items => {
        this.products = items;
        this.resetPaginator();
        this.isLoadingProducts = false;
      },
      error: err => { console.error(err); this.isLoadingProducts = false; }
    });
  }

  private loadProductsByCategory(categoryId: number): void {
    this.isLoadingProducts = true;
    this.productService.getByCategory(categoryId).subscribe({
      next: items => {
        this.products = items;
        this.resetPaginator();
        this.isLoadingProducts = false;
      },
      error: err => { console.error(err); this.isLoadingProducts = false; }
    });
  }

  // ---------- Categorías ----------
  private loadRootCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getNodes(null).subscribe({
      next: nodes => {
        this.categories = nodes;
        this.atLeaf = nodes.length === 0;
        this.isLoadingCategories = false;
      },
      error: err => { console.error(err); this.isLoadingCategories = false; }
    });
  }

  private loadChildren(parentId: number): void {
    this.isLoadingCategories = true;
    this.categoryService.getNodes(parentId).subscribe({
      next: nodes => {
        this.categories = nodes;
        this.atLeaf = nodes.length === 0;
        this.isLoadingCategories = false;
      },
      error: err => { console.error(err); this.isLoadingCategories = false; }
    });
  }

  // ---------- UI handlers ----------
  onSelectCategory(categoryId: number): void {
    const node = this.categories.find(c => c.id === categoryId);
    if (!node) return;

    this.selectedCategoryId = categoryId;
    this.pushToBreadcrumb(categoryId, node.name);
    this.loadProductsByCategory(categoryId);
    this.loadChildren(categoryId);
  }

  onBreadcrumbClick(index: number): void {
    const target = this.breadcrumb[index];
    this.breadcrumb = this.breadcrumb.slice(0, index + 1);
    this.selectedCategoryId = target.id;
    this.categoryCtrl.setValue(target.id, { emitEvent: false });
    this.loadProductsByCategory(target.id);
    this.loadChildren(target.id);
  }

  clearFilter(): void {
    this.selectedCategoryId = null;
    this.breadcrumb = [];
    this.categoryCtrl.reset(null, { emitEvent: false });
    this.loadRootCategories();
    this.loadProductsHome();
  }

  // Sustitutos de (page) del MatPaginator
  onPrevPage(): void {
    if (this.pageIndex > 0) this.pageIndex--;
  }

  onNextPage(): void {
    if ((this.pageIndex + 1) < this.totalPages) this.pageIndex++;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0; // reset page al cambiar tamaño
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
  }

  private pushToBreadcrumb(id: number, name: string): void {
    const existsIdx = this.breadcrumb.findIndex(b => b.id === id);
    if (existsIdx >= 0) this.breadcrumb = this.breadcrumb.slice(0, existsIdx + 1);
    else this.breadcrumb.push({ id, name });
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
