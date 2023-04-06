import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading$ = this.authService.isLoading$;
  
  constructor(private authService: AuthService) {}

  onLogin(signupForm: NgForm) {
    const {email, password} = signupForm.value;

    this.authService.login(email, password);
  }
}
