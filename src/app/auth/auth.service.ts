import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, finalize, map, of } from "rxjs";
import { AuthData } from "./auth.model";
import { environment } from 'src/enviroments/enviroment';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoadingSource = new BehaviorSubject<boolean>(false);
  private userAuthenticatedToken = new BehaviorSubject<string | null>(null);
  private tokenTimer: any;
  private _userId: string;
  userAuthenticated$ = this.userAuthenticatedToken.asObservable().pipe(map(val => !!val));
  isLoading$ = this.isLoadingSource.asObservable();

  constructor(
    private httpClient: HttpClient,
    private router: Router) {}

  get token(): string | null {
    const token = this.userAuthenticatedToken.value;

    return token ? 'Bearer ' + token : null;
  }

  get userId(): string {
    return this._userId;
  }

  createUser(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password
    };

    this.isLoadingSource.next(true);

    this.httpClient.post(BACKEND_URL + '/signup', authData)
    .pipe(
      finalize(() => this.isLoadingSource.next(false))
    )
    .subscribe((res) => {
      this.router.navigate(['/']);
    });
  }

  login(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password
    };

    this.isLoadingSource.next(true);

    this.httpClient.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + '/login', authData)
    .pipe(
      finalize(() => this.isLoadingSource.next(false))
    )
    .subscribe((res) => {
      const { token, expiresIn, userId} = res;

      if(token) {
        this.userAuthenticatedToken.next(token);
        this._userId = userId;

        this.router.navigate(['/']);

        const expirationDate = new Date(Date.now() + expiresIn * 1000);


        this.saveAuthData(token, expirationDate, userId);

        this.setAuthTimer(expiresIn);
      }
    });
  }

  autoAuthUser(): void {
    const authInfo = this.getAuthData();
    if(!authInfo) {
      return;
    }

    const expiresIn = new Date(authInfo.expirationDate).getTime() - Date.now();

    if(expiresIn > 0) {
      this.userAuthenticatedToken.next(authInfo.token);
      this.setAuthTimer(expiresIn / 1000);
      this._userId = authInfo.userId;
    }

  }

  logout(): void {
    clearTimeout(this.tokenTimer);
    this.userAuthenticatedToken.next(null);
    this.router.navigate(['/']);
    this._userId = null;
    this.clearAuthData();
  }

  private setAuthTimer(expiresIn: number): void {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresIn * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    const userId = localStorage.getItem('userId');

    if(token && expirationDate) {
      return { token, expirationDate, userId };
    }

    return;

  }

}
