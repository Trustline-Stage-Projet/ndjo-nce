import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CrmService } from '../services/crm.service';
@Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private router: Router) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((error) => {
//         if (error instanceof HttpErrorResponse && error.status === 401) {
//           this.router.navigate(['/log'], {
//             queryParams: {
//               message: 'Votre session a expiré. Veuillez vous reconnecter.',
//             },
//           });
//         }
//         return throwError(error);
//       })
//     );
//   }
// }

export class AuthInterceptor implements HttpInterceptor {
  private isLoggingOut = false;

  constructor(private router: Router, private _crmService: CrmService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Vérifier si c'est une requête de déconnexion
    if (req.url.includes('/logout')) {
      this.isLoggingOut = true;

      return next.handle(req).pipe(
        finalize(() => {
          // Réinitialiser la variable après la demande de déconnexion
          this.isLoggingOut = false;
        })
      );
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (this.isLoggingOut && error instanceof HttpErrorResponse && error.status === 200) {
          // Ignorer les erreurs si c'est une demande de déconnexion réussie
          return of(new HttpResponse({ status: 200 }));
        }

        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.router.navigate(['/log'], {
            queryParams: {
              message: 'Votre session a expiré. Veuillez vous reconnecter.',
            },
          });
        }

        return throwError(error);
      })
    );
  }
}
