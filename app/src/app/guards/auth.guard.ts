import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  allowGameAccess = false;
  allowResultsAccess = false;

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (
      state.url === '/' ||
      (state.url === '/game' && this.allowGameAccess) ||
      (state.url === '/results' && this.allowResultsAccess)
    ) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}
