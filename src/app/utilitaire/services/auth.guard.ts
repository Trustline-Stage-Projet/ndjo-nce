// auth.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { CrmService } from './crm.service';

@Injectable({
  providedIn: 'root',
})
// export class AuthGuard implements CanActivate {
//   constructor(private usersService: CrmService, private router: Router) {}

//   canActivate(): boolean {
//     if (this.usersService.isUserAuthenticated()) {
//       return true; // L'utilisateur est authentifié, permet l'accès à la page
//     } else {
//       this.router.navigate(['/log']); // Redirige vers la page de connexion
//       return false;
//     }
//   }
// }

export class AuthGuard implements CanActivate {
  constructor(private crmService: CrmService, private router: Router) {}

 // Dans AuthGuard
canActivate(route: ActivatedRouteSnapshot): boolean {
  const requiredType = route.data['expectedType'];
  const userType = this.crmService.getUserType();

  console.log('Vérification du type d\'utilisateur pour l\'accès à la route', {requiredType, userType});

  if (this.crmService.isUserAuthenticated() && userType === requiredType) {
    console.log('Accès autorisé');
    return true;
  } else {
    console.log('Accès refusé', {isAuthenticated: this.crmService.isUserAuthenticated(), userType, requiredType});
    this.router.navigate(['/log']);
    return false;
  }
}

}
