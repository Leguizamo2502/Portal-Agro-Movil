import { Component, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonLabel } from "@ionic/angular/standalone";
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabBarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
