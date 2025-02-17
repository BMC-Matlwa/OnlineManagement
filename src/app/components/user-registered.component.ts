import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Product } from '../product.model'; 
import { NavbarComponent } from '../components/navbar.component'; 

@Component({
  selector: 'app-user-registered',
  standalone: true,
  imports: [CommonModule, FormsModule,NavbarComponent],
  templateUrl: './user-registered.component.html',
  styleUrl: './user-registered.component.css'
})
export class UserRegisteredComponent {

  users: any[] = [];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.dataService.getUsers().subscribe(
      (response) => {
        this.users = response;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }  
  
  formatOrderDate(orderDate: string): string {
    const date = new Date(orderDate);
    // return date.toLocaleString(); // You can customize the format here
    const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }

  toggleEdit(user: any): void {
    user.editMode = true;
  }
  
  saveUser(user: any): void {
    this.dataService.updateUserP(user.id, user).subscribe(
      () => {
        alert('User updated successfully!');
        user.editMode = false;
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }
  
  cancelEdit(user: any): void {
    user.editMode = false;
  }

  
}
