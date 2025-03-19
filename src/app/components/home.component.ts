import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../components/navbar.component'; 
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ChatbotComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
    userRole: string = '';
  constructor(private router: Router, private dataService: DataService) {}


  ngOnInit(): void {
    this.getUserRole();
  }

  getUserRole(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.getUserInfo(userId).subscribe(
        (response) => {
            // console.log('User Info:', response); //To show logged in body request.
          this.userRole = response.role;  // Assuming the response has a 'role' field
        },
        (error) => {
          console.error('Error fetching user info:', error);
        }
      );
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
  
  goToDashboard(tab: string): void {
    this.router.navigate(['/dashboard'], { queryParams: { tab } });
  }

  goToOrders(): void {
    this.router.navigate(['/order-history'])
  }

  goToCart(): void {
    this.router.navigate(['/View-cart'])
  }

  goToUsers(): void {
    this.router.navigate(['/users-registered'])
  }

  goToDash(): void {
    this.router.navigate(['/analysis'])
  }
}
