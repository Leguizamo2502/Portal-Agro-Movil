import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SidebarService } from 'src/app/shared/services/sidebar/sidebar.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HasRoleDirective } from 'src/app/core/directives/has-role.directive';
import { UserSelectModel } from 'src/app/core/models/user.model';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, HasRoleDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private sidebarService = inject(SidebarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  user?: UserSelectModel;
  isOpen = false; // estado del sidebar
  activePath = '';

  openSubmenus: { [key: string]: boolean } = {
    security: false,
    parameters: false,
  };

  private resizeListener?: () => void;

  constructor() {
    // reaccionar a cambios en el estado del sidebar (signal/effect)
    effect(() => {
      this.isOpen = this.sidebarService.sidebarOpen();
    });

    this.loadUser();
  }

  ngOnInit(): void {
    // obtener ruta activa al iniciar
    this.activePath = this.router.url.split('/').slice(2).join('/') || this.router.url.split('/').pop() || '';

    this.resizeListener = () => {
      this.sidebarService.initializeBasedOnScreenSize();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private loadUser(): void {
    this.authService.GetDataBasic().subscribe((data) => {
      this.user = data;
    });
  }

  navigateTo(path: string): void {
    this.router.navigate(['/account/' + path]);
    this.activePath = path;
    this.sidebarService.closeOnMobile();
  }

  toggleSubmenu(menu: string): void {
    this.openSubmenus[menu] = !this.openSubmenus[menu];
  }
}
