import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { catchError, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";
import { User } from "./user.model";

export interface AuthResponseData  {
  idToken:string,
  email:string,
  refreshToken:string,
  expiresIn:string,
  localId:string,
  registered?:boolean,
}

@Injectable({providedIn: "root"})

export class AuthService  {

  user = new Subject<User>()

  constructor(private http: HttpClient) {}

  signup(email:string, password:string)  {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBxcdkjm_0BY1YgMhbFrapJtRCaR6d252Y',{
      email: email,
      password: password,
      returnSecureToken: true,
    })
    .pipe(catchError(this.handleError), tap(responseData => {
      this.handleAuthentication(
        responseData.email,
        responseData.localId,
        responseData.idToken,
        +responseData.expiresIn
      )
    }));
  }
  login(email:string, password:string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBxcdkjm_0BY1YgMhbFrapJtRCaR6d252Y', {
      email: email,
      password: password,
      returnSecureToken: true,
    })
    .pipe(catchError(this.handleError), tap(responseData => {
      this.handleAuthentication(
        responseData.email,
        responseData.localId,
        responseData.idToken,
        +responseData.expiresIn
      )
      }));
  }

  private handleAuthentication(email:string, userId:string , token:string, expiresIn:number)  {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);

    this.user.next(user);
  }

  private handleError(errorResponse:HttpErrorResponse)  {
    let errorMessage = 'An unknown error has occurred.';
      if (!errorResponse.error || !errorResponse.error.error) {
        return throwError(() => errorMessage);
      }
      switch(errorResponse.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'This email already has an account. Please log in.';
        break;

        case 'INVALID_PASSWORD':
          errorMessage = 'That is not the password registered with the given email. Please check your password and try again.';
        break;

        case 'EMAIL_NOT_FOUND':
          errorMessage = 'This email is not registered. Please sign-up.';
        break;

        case 'TOO_MANY_ATTEMPS_TRY_LATER':
          errorMessage = 'I dont believe you are who you say you are. Goodbye.';
        break;

      }
      return throwError(() => errorMessage);
  }

}
