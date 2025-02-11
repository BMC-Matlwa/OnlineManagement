import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      return true; // Allow access for admin
    }
    alert('Access Denied! You do not have permission to view this page.');
    this.router.navigate(['/home']); // Redirect to home if not admin
    return false;
  }
}
