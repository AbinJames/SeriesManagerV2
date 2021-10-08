import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../shared-services/login.service';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input('loginSuccessful') loginSuccessful = false;
  constructor(public loginService: LoginService, public sharedDataService : SharedDataService) { }

  ngOnInit() {
  }

  onLogoutClick() {
    this.loginService.logout();
  }
}
