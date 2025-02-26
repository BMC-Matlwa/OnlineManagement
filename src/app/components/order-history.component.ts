import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  
import { NavbarComponent } from '../components/navbar.component'; 

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent {
  orders: any[] = []; //to view user orders
  products: any[] = [];
  userId!: number; // Definite assignment assertion
  userRole: string = '';

  constructor(private dataService: DataService, private router: Router) {}
  

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    const userId = this.getLoggedInUserId(); 
    if (userId) {
      this.dataService.getOrdersByUser(userId).subscribe(
        (response) => {
          this.orders = response;
          console.log('Orders fetched for user:', this.orders);
        },
        (error) => {
          console.error('Error fetching orders for user:', error);
        }
      );
    } else {
      console.error('User not logged in');
    }
  }

  formatOrderDate(orderDate: string): string {
    const date = new Date(orderDate);
    return date.toLocaleString(); // You can customize the format here
  }

  getLoggedInUserId(): string | null {
    return localStorage.getItem('userId');  
  }

  placeOrder(product: any): void {
    const quantity = product.orderQuantity;
    if (!quantity || isNaN(+quantity) || +quantity <= 0) { //if quantity is null or not a number or less/= than 0.
      alert('Invalid quantity.');
      return;
    }
  
    const order = {
      userId: this.userId,           // Ensure userId is set
      productName: product.name,     // Product name
      quantity: +quantity,           // Convert quantity to a number
      price: product.price * +quantity  // Calculate the total price
    };
  
    this.dataService.placeOrder(order).subscribe(
      (response) => {
        console.log('Order placed:', response);
        alert('Order placed successfully.');

        this.refreshProductList(); //to refresh the page after adding.
      },
      (error) => {
        console.error('Error placing order:', error);
        alert('Failed to place order.');
      }
    );
  }

  refreshProductList(): void {
    // Call your data service or API to get the updated list of products
    this.dataService.getProducts().subscribe(
      (response) => {
        this.products = response;  // Update the products list
      },
      (error) => {
        console.error('Error fetching updated products:', error);
      }
    );
  }

  increaseQuantity(index: number): void {
    this.orders[index].quantity++;
  }
  
  decreaseQuantity(index: number): void {
    if (this.orders[index].quantity > 1) {
      this.orders[index].quantity--;
    } else {
      this.removeFromCart(index); // If quantity reaches 0, remove the item
    }
  }
  
  removeFromCart(index: number): void {
    this.orders.splice(index, 1);
  }
  
  getProcessingOrders() {
    return this.orders.filter(order => order.status === 'Processing');
  }
}
