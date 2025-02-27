import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Product } from '../product.model'; 
import { NavbarComponent } from '../components/navbar.component'; 
import { take } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatTabsModule,
    MatTableModule,
    MatButtonModule,CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements AfterViewInit {

  allData: any[] = [];
  orders: any[] = [];
  data: any[] = []; // Array to hold fetched data
  newItem: any = { // For new item data binding
    name: '',
    stock: null,
    price: null,
    description: null,
    image: null
  }; 
  editingItem: any = null; // For editing item
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  products: Product[] = [];
  @ViewChild('tabGroup') tabGroup!: MatTabGroup; //to record the tabs
  selectedTabIndex = 0;
  sumApprovedOrders: number = 0;
  sumDeclinedOrders: number = 0;
  sumPendingOrders: number = 0;
  sumAllOrders: number = 0;
  currentPage = 1;
  itemsPerPage = 5; 
  totalItems: number = this.products.length;
  searchQuery: string = '';
  selectedImage: string | null = null;
  sortedOrders: any[] = [];
  sortColumn: string = ''; // Column being sorted
  sortDirection: 'asc' | 'desc' = 'asc'; // Sorting or
  
  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {}


  ngAfterViewInit(): void {
    this.fetchData();
    // Assuming the user ID is available after login (either from a service or localStorage)
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
    this.userRole = localStorage.getItem('userRole')  || ''; // Retrieve the user role
    
    //get orders and username
    this.dataService.getOrders().subscribe((response) => {
      this.orders = response;
    });
  }

  //VIEW AND ADD PRODUCTS

  fetchData(): void {
    this.dataService.getData().subscribe(
      (response) => {
        this.allData = response;
        this.data = [...this.allData]

        this.totalItems = this.data.length;
        this.updatePagination();
        console.log("Fetched Products:", this.allData);
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  updatePagination(): void {
    this.totalItems = this.data.length;
  }

   // Get the current page of users
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    console.log('Displaying users from index:', start, 'to', end);
    return this.data.slice(start, end);
  }

  // Go to the next page
 nextPage() {
  console.log('Next page clicked', this.currentPage, this.totalPages); // Debugging log
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    console.log('New currentPage after nextPage:', this.currentPage); // Debugging log
  }
}

previousPage() {
  console.log('Previous page clicked', this.currentPage); // Debugging log
  if (this.currentPage > 1) {
    this.currentPage--;
    console.log('New currentPage after previousPage:', this.currentPage); // Debugging log
  }
}

get totalPages() {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}

searchProducts(): void {
  console.log("Search Query:", this.searchQuery); // Debugging
  if (this.searchQuery.trim() === '') {
    this.data = [...this.allData]; // Reset if search is empty
  } else {
    const query = this.searchQuery.toLowerCase();
    this.data = this.allData.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  }
  this.currentPage = 1; // Reset pagination
  this.totalItems = this.data.length; // Update total items count
  this.updatePagination();
  console.log("Filtered Users:", this.data); // Debugging
}

  addProductData() {
    const orderData = {
      name: this.newItem.name,
      stock: this.newItem.stock,
      price: this.newItem.price,
      description: this.newItem.description,
      image_url: this.newItem.image_url
    };

    this.dataService.addProduct(orderData).pipe(
      catchError((error) => {
        console.error('Error adding order:', error);
        alert('Failed to add order');
        throw error;
      })
    ).subscribe(
      (response) => {
        console.log('Order added successfully:', response);
        alert('Order added successfully!');
        location.reload(); //reload the whole page
        this.newItem = { name: '', stock: null, price: null }; // Reset form fields
      }
    );
  }

  toggleEdit(item: any): void {
    this.editingItem = { ...item }; // Create a copy of the item to edit
    item.editMode = true;
  }
  editData(item: any): void {
    this.editingItem = { ...item }; // Create a copy of the item to edit
    
  }
  
  cancelEdit(item: any): void {
    item.editMode = false; // Exit edit mode
    this.editingItem = null; // Reset editing item
  }
  

  saveUser(user: any): void {
    this.dataService.updateUserP(user.id, user).subscribe(
      () => {
        alert('User updated successfully!');
        user.editMode = false;
        location.reload(); //reload the whole page
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }

  updateData(): void {
    if (this.editingItem) {
      this.dataService.updateData(this.editingItem.id, this.editingItem).subscribe(
        (response) => {
          // Find the index of the edited item
          const index = this.data.findIndex((item) => item.id === this.editingItem.id);
          if (index !== -1) {
            // Update the specific item with the latest changes
            this.data[index] = { ...this.editingItem };
            this.data = [...this.data]; // Ensure change detection
            this.editingItem = null; // Reset editing item
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
        location.reload();
      },
      (error) => {
        console.error('Error deleting data:', error);
      }
    );
  }

  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }
  
  closeImage(): void {
    this.selectedImage = null;
  }
  
  goToEdit(tab: string): void {
    this.router.navigate(['/admin'], { queryParams: { tab } });
  }
}
