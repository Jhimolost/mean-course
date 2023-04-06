import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  isLoading$ = this.authService.isLoading$;

  constructor(private authService: AuthService) {}

  onSignup(signupForm: NgForm) {
    const {email, password} = signupForm.value;

    this.authService.createUser(email, password);
  }
}
