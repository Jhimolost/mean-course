import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(
    private _snackBar: MatSnackBar) {

  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        this._snackBar.open(error.error.message, 'X', {
          duration: 3000
        });
        return throwError(error);
      })
    )
  }

}
