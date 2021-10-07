import { Injectable, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../login/user-data.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private users: UserData[] = [new UserData('user', '1234')];
  isLoggedIn: boolean;
  @Output() loginClicked = new EventEmitter<boolean>();
  @Output() logoutClicked = new EventEmitter<boolean>();
  constructor(private router: Router) { }

  login(userName: string, pass: string) {
    if (this.users.find(i => i.password === pass && i.username === userName)) {
      this.isLoggedIn = true;
      this.loginClicked.emit(true);
      this.router.navigate(['dashboard']);
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.logoutClicked.emit(false);
  }

  isAuthenticated() {
    const promise = new Promise(
      (resolve, reject) => {
        setTimeout(() => {
          resolve(this.isLoggedIn);
        }, 0); // 0 - timeout
      }
    );
    return promise;
  }

  signup(user: UserData) {
    this.users.push(user);
    this.isLoggedIn = true;
    this.loginClicked.emit(true);
    this.router.navigate(['statistics']);
  }
}
