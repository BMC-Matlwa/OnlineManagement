import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  
import { NavbarComponent } from '../components/navbar.component'; 
import { Product } from '../product.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';



@Component({
    selector: 'app-dashboard',
    standalone: true,
        imports: [MatTabsModule,
          MatTableModule,
          MatButtonModule,CommonModule, FormsModule, NavbarComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    
})
export class DashboardComponent implements AfterViewInit {
  products: any[] = [];
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  orders: any[] = []; //to view user orders
@ViewChild('tabGroup') tabGroup!: MatTabGroup; //to record the tabs
  selectedTabIndex = 0;

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    this.fetchProducts();
    this.fetchOrders(); // Load orders when the component initializes
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
    this.userRole = localStorage.getItem('userRole')  || ''; 

    setTimeout(() => {
      this.route.queryParams.subscribe((params) => {
        const tab = params['tab'];
        if (tab === 'products') {
          this.tabGroup.selectedIndex = 1;  // 1 corresponds to Products tab
        } else if (tab === 'orders') {
          this.tabGroup.selectedIndex = 0;  // 0 corresponds to Orders tab
        }
      });
    });
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

  fetchProducts(): void {
    this.dataService.getProducts().subscribe(
      (response) => {
        this.products = response;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
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

  
}