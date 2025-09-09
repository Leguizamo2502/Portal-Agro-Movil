import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/** === Ionicons: registra solo los íconos que usas === */
import { addIcons } from 'ionicons';
import {
  person,
  location,
  create,
  trash,
  star,
  starOutline,
  chevronForward,
  refresh,
  menu,
  search,
  cubeOutline,
  notifications,
  personCircle,
} from 'ionicons/icons';

// registra los SVG (evita cargar por URL y quita los warnings)
addIcons({
  person,
  location,
  create,
  trash,
  star,
  'star-outline': starOutline,
  'chevron-forward': chevronForward,
  refresh,
  menu,
  search,
  'cube-outline': cubeOutline,
  notifications,
  'person-circle': personCircle,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
