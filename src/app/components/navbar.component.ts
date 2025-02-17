import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  userName: string = ''; // Variable to store the user's name
  isAdmin: boolean = false;
  menuOpen = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.getUserInfo(userId).subscribe(
        (response) => {
          this.userName = response.name || response.email; // Set userName from the server response
          this.isAdmin = response.role === 'admin';
        },
        (error) => {
          console.error('Error fetching user info:', error);
        }
      );
    } else {
      console.error('User ID not found in localStorage');
    }
  }

  logout(): void {
    localStorage.removeItem('userId'); // Remove userId from localStorage
    this.userName = ''; // Reset userName
    this.isAdmin = false; // Reset isAdmin flag
    window.location.href = '/'; // Redirect to home page
    console.log('User logged out');
    this.menuOpen = false;
  }

  // logout() {
  //   console.log('User logged out');
  //   this.menuOpen = false;
  //   // Add actual logout logic, like clearing tokens or redirecting to login
  // }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  
}
