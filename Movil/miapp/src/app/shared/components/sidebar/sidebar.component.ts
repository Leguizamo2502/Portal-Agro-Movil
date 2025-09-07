import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/angular/standalone';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserSelectModel } from 'src/app/core/models/user.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
    RouterLink,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls:['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activePath = '';
  user?: UserSelectModel;

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.authService.GetDataBasic().subscribe((data) => {
      this.user = data;
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
    this.activePath = path;
  }
}
