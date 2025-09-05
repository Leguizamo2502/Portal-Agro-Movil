import { Component, OnInit } from '@angular/core';
import { TabBarComponent } from "src/app/component/tab-bar/tab-bar.component";
import { FooterComponent } from "src/app/component/footer/footer.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [TabBarComponent, FooterComponent],
})
export class LoginComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
