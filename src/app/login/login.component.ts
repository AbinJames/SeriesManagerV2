import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoginService } from '../shared-services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('userName') userName: ElementRef;
  @ViewChild('pass') pass: ElementRef;
  loginTried = false;

  constructor(public loginService: LoginService) { }

  ngOnInit() {
  }

  loginClick(){
    this.loginService.login(this.userName.nativeElement.value,this.pass.nativeElement.value);
    this.loginTried=true;
  }
}
