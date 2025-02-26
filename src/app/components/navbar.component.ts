import { Component, OnInit, HostListener } from '@angular/core';
import { DataService } from '../data.service';
import { CartService } from '../cart.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  role: string ='';
  orders: any[] = [];
  showCart = false;
  // items: any[] = [];
  userId!: number;

  constructor(private router: Router, private cartService: CartService, private dataService: DataService) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchOrders(); // Load orders when the component initializes
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
  }

  // HostListener to listen for clicks outside the dropdown
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.menu') && this.menuOpen) {
      this.menuOpen = false; // Close the dropdown if clicked outside
    }
  }

  @HostListener('document:click', ['$event'])
  closeCart(event: Event) {
    const cartElement = document.querySelector('.cart-dropdown');
    if (cartElement && !cartElement.contains(event.target as Node)) {
      this.showCart = false;
    }
  }

  toggleCart(event: Event) {
    event.stopPropagation(); // Prevent click from closing immediately
    this.showCart = !this.showCart;
  }
  

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
   // Close the menu when clicking outside of it
   closeMenu(event: Event) {
    if (!this.menuOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.menu')) {
      this.menuOpen = false;
    }
  }

  getLoggedInUserId(): string | null {
    return localStorage.getItem('userId');  
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
  

  getUserInfo(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.getUserInfo(userId).subscribe(
        (response) => {
          this.userName = response.name || response.email; // Set userName from the server response
          this.role = response.role;
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

  
  
  // Stop event propagation for clicks inside the dropdown
  stopEvent(event: Event) {
    event.stopPropagation();
  }
  
 

  userDetails(){
    window.location.href = '/user-details';
  }

  goHome(){
    window.location.href = '/home';
  }

  goToDashboard(tab: string): void {
    this.router.navigate(['/dashboard'], { queryParams: { tab } });
  }
  // getTotalQuantity(): number {
  //   return this.orders.reduce((total, order) => total + order.quantity, 0);
  // }

  getTotalQuantity(): number {
    return this.orders.reduce((total, order) => total + order.quantity, 0);
  }  

  viewCart(): void {
    window.location.href = '/View-cart'; // Redirect to home page
  }
  
}
