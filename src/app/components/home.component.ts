import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../components/navbar.component'; 


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
