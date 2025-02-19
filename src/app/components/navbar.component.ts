import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostListener } from '@angular/core';

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
  isUser: boolean = false;
  isInactive: boolean = false;

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
          this.isUser = response.role === 'user';
          this.isInactive = response.role === 'Inactive';
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
  
  // Stop event propagation for clicks inside the dropdown
  stopEvent(event: Event) {
    event.stopPropagation();
  }
  
     // HostListener to listen for clicks outside the dropdown
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.menu') && this.menuOpen) {
      this.menuOpen = false; // Close the dropdown if clicked outside
    }
  }

  userDetails(){
    window.location.href = '/user-details';
  }

   // Close the menu when clicking outside of it
   closeMenu(event: Event) {
    if (!this.menuOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.menu')) {
      this.menuOpen = false;
    }
  }
}
