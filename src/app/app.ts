import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './components/notifications/notifications';
import { TokenValidatorComponent } from './components/token-validator/token-validator';
import { appConfig } from './config/app.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationsComponent, TokenValidatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = appConfig.app.name;
  protected apiUrl = appConfig.api.baseUrl;
  protected isProduction = appConfig.app.production;
}
