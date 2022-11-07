import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'auth-with-Max';
  isLoginMode = true;
  isLoading = false;
  error = null;

  constructor(private authService: AuthService) {}

  onSwitchMode()  {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm)  {
    if (!authForm.valid)  {
      return;
    }

    const email = authForm.value.email;
    const password = authForm.value.password;
    let authObservable: Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObservable = this.authService.login(email, password);
    } else  {

    authObservable = this.authService.signup(email, password);
    }

    authObservable.subscribe(
      responseData =>  {
        console.log(responseData);
        this.isLoading = false;
        },
        errorMessage => {
          console.log(errorMessage);
          this.error = errorMessage;
          this.isLoading = false;
        }
    );

    // console.log(authForm.value);
    authForm.reset();
    this.isLoading = false;

  };

}



