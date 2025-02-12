import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Product } from '../product.model'; 
import { NavbarComponent } from '../components/navbar.component'; 
import { take } from 'rxjs/operators';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  orders: any[] = [];
  data: any[] = []; // Array to hold fetched data
  newItem: any = {}; // For new item data binding
  editingItem: any = null; // For editing item
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  products: Product[] = [];


  constructor(private dataService: DataService, private router: Router) {}


  ngOnInit(): void {
    this.fetchOrders(); // Load orders when the component initializes
    this.fetchData();
    // Assuming the user ID is available after login (either from a service or localStorage)
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
    this.userRole = localStorage.getItem('userRole')  || ''; // Retrieve the user role
  }

  fetchOrders(): void {
    this.dataService.getOrders().subscribe(
      (response) => {
        this.orders = response;
        console.log('Orders fetched:', this.orders);
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  approveOrder(order: any): void {
    // const productName = order.name;

    this.dataService.updateOrderStatus(order.id, 'Approved').subscribe(
      (response) => {
        console.log('Order approved:', response);
        order.status = 'Approved';


        this.updateProductQuantity(order.product_name, order.quantity);
        console.log('Product_Name:', order.product_name);
      },
      (error) => {
        console.error('Error approving order:', error);
      }
    );
  }

  declineOrder(order: any): void {
    // const productName = order.name;

    this.dataService.updateOrderStatus(order.id, 'Declined').subscribe(
      (response) => {
        console.log('Order declined:', response);
        order.status = 'Declined';


        this.updateProductQuantity(order.product_name, order.quantity);
        console.log('Product_Name:', order.product_name);
      },
      (error) => {
        console.error('Error declining order:', error);
      }
    );
  }
  
  updateProductQuantity(productName: string, orderedQuantity: number): void {
    console.log('Product Name:', productName);
    

  // Fetch the product by name and update its stock
  this.dataService.getProductByName(productName).subscribe(
    (product: any) => {
      const newStock = product.stock - orderedQuantity;
      if (newStock >= 0) {
        // Update the stock for the product based on product name
        this.dataService.updateProductStock(product.id, newStock).subscribe(
          (response) => {
            console.log(`Stock updated for product ${productName}:`, response);
          },
          (error) => {
            console.error(`Error updating stock for product ${productName}:`, error);
          }
        );
      } else {
        console.warn(`Insufficient stock for product ${productName}.`);
      }
    },
    (error) => {
      console.error(`Error fetching product ${productName}:`, error);
    }
  );
  }
  
  
  
  updateOrderStatus(order: any, status: string): void {
    this.dataService.updateOrderStatus(order.id, status).subscribe(
      (response) => {
        order.status = status;
        alert(`Order status updated to ${status}`);
      },
      (error) => {
        console.error('Error updating order status:', error);
      }
    );
  }


  //VIEW AND ADD PRODUCTS

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
