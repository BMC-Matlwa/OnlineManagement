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
  menuOpen = true;
  isUser: boolean = false;
  isInactive: boolean = false;
  role: string ='';
  orders: any[] = [];
  showCart = false;
  // items: any[] = [];
  userId!: number;
  cart: any[] = [];
  cartItems: any[] = [];
  cartEmpty: boolean = false;

  constructor(private router: Router, private cartService: CartService, private dataService: DataService) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.loadCart();
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
  

  // toggleMenu() {
  //   this.menuOpen = !this.menuOpen;
  // }
  //  // Close the menu when clicking outside of it
  //  closeMenu(event: Event) {
  //   if (!this.menuOpen) return;
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.dropdown') && !target.closest('.menu')) {
  //     this.menuOpen = false;
  //   }
  // }

  getLoggedInUserId(): string | null {
    return localStorage.getItem('userId');  
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
    this.clearChatHistory(); // Clear chat messages
    window.location.href = '/'; // Redirect to home page
    console.log('User logged out');
    this.menuOpen = false;
  }
  
  
  // Stop event propagation for clicks inside the dropdown
  stopEvent(event: Event) {
    event.stopPropagation();
  }
  
  clearChatHistory() {
    localStorage.removeItem('chatHistory');
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
  goToAnalysis(): void {
    window.location.href = '/analysis';
  }
  // getTotalQuantity(): number {
  //   return this.orders.reduce((total, order) => total + order.quantity, 0);
  // }

  loadCart(): void {
    const userId = Number(localStorage.getItem('userId')); // Convert string to number
    if (userId) {
      this.dataService.getUserCartCheckout(userId).subscribe(
        (response) => {
          this.cart = response;
          this.cartEmpty = this.cart.length === 0; //marks empty if there is nothing
          console.log('Orders fetched for user:', response);
          console.log("Fetched Cart Data:", response);
          this.cartItems = response;
        },
        (error) => {
          console.error('Error fetching orders for user:', error);
        }
      );
    } else {
      console.error('User not logged in');
    }
  }

  getTotalQuantity(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }  

  viewCart(): void {
    window.location.href = '/View-cart'; // Redirect to home page
  }
  
}
