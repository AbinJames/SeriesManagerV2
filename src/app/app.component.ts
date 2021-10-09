import { Component } from '@angular/core';
import { LoginService } from './shared-services/login.service';
import { SharedDataService } from './shared-services/shared-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SeriesManagerV2';
  loginSuccessful = true;

  constructor(public loginService: LoginService, private sharedDataService: SharedDataService) { }


  ngOnInit() {
    this.sharedDataService.initializeSeriesList();
    this.loginService.loginClicked
      .subscribe(
        (loginSuccessful: boolean) => {
          this.loginSuccessful = loginSuccessful;
        }
      );
    this.loginService.logoutClicked
      .subscribe(
        (loginSuccessful: boolean) => {
          this.loginSuccessful = loginSuccessful;
        }
      );
  }
}
