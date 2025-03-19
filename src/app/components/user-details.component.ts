import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { NavbarComponent } from '../components/navbar.component'; 
import { ChatbotComponent } from './chatbot.component';


@Component({
  selector: 'app-user-details',
  standalone: true,
    imports: [FormsModule, CommonModule, NavbarComponent, ChatbotComponent],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user: any = {};
  editMode = false;
  userName: string = '';
  isAdmin: boolean = false;
  showToast = false;

  constructor(private dataService: DataService, private router:Router) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

 getUserDetails(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.getUserInfo(userId).subscribe(
        (response) => {
          this.user = response; // Set full user details
          this.userName = response.name || response.email; // Display userName if available
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

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  saveDetails(): void {
    const storedUserId = localStorage.getItem('userId');
    console.log('Updating user with ID:', storedUserId); 
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.updateUser(userId, this.user).subscribe(
        (response) => {
          this.editMode = false;
          // alert('User details updated successfully!');
          this.showToast = true;
      // Delay page reload by 10 seconds
setTimeout(() => {
  location.reload();
}, 3000); 
    setTimeout(() => this.showToast = false, 3000); // Hide after 10 seconds
        },
        (error) => {
          console.error('Error updating user details:', error);
          alert('Failed to update user details.');
        }
      );
    } else {
      console.error('User ID not found in localStorage');
    }
  }
  
  show() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000); // Hide after 3 seconds
  }
  
}
