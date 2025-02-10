import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  
import { NavbarComponent } from '../components/navbar.component'; 


@Component({
    selector: 'app-dashboard',
    standalone: true,
        imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    
})
export class DashboardComponent implements OnInit {
  data: any[] = []; // Array to hold fetched data
  newItem: any = {}; // For new item data binding
  editingItem: any = null; // For editing item
  userId!: number; // Definite assignment assertion

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.fetchData();
    // Assuming the user ID is available after login (either from a service or localStorage)
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Example: getting userId from localStorage
  }

  fetchData(): void {
    this.dataService.getData().subscribe(
      (response) => {
        this.data = response;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  addData(): void {
    if (this.userId && this.userId !== 0) {
      this.newItem.user_id = this.userId; // Add the user_id to the new item
      this.dataService.addData(this.newItem).subscribe(
        (response) => {
          this.data.push(response); // Add the new item to the data array
          this.newItem = {}; // Clear form after adding
        },
        (error) => {
          console.error('Error adding data:', error);
        }
      );
    } else {
      console.error('User ID is missing or invalid!');
    }
  }
  

  editData(item: any): void {
    this.editingItem = { ...item }; // Create a copy of the item to edit
  }

  updateData(): void {
    if (this.editingItem) {
      this.dataService.updateData(this.editingItem.id, this.editingItem).subscribe(
        (response) => {
          const index = this.data.findIndex((item) => item.id === this.editingItem.id);
          if (index !== -1) {
            this.data[index] = this.editingItem; // Update the item in the array
            this.editingItem = null; // Clear editing
          }
        },
        (error) => {
          console.error('Error updating data:', error);
        }
      );
    }
  }

  deleteData(id: number): void {
    this.dataService.deleteData(id).subscribe(
      (response) => {
        this.data = this.data.filter((item) => item.id !== id); // Remove the deleted item
      },
      (error) => {
        console.error('Error deleting data:', error);
      }
    );
  }
}