import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  
import { NavbarComponent } from '../components/navbar.component'; 

@Component({
  selector: 'app-order-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './order-cart.component.html',
  styleUrl: './order-cart.component.css'
})
export class OrderCartComponent {

  orders: any[] = []; //to view user orders
  products: any[] = [];
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  cart: any[] = [];
  cartItems: any[] = [];
  cartEmpty: boolean = false;

  constructor(private dataService: DataService, private router: Router) {}
  

  ngOnInit(): void {
    // this.fetchOrders();
    this.loadCart();
  }


  // loadCart(): void {
  //   this.dataService.getCart().subscribe((data) => {
  //     this.cartItems = data.filter(item => item.status === 'Pending Checkout'); // Ensure filtering works
  //     console.log("Cart items:", this.cartItems); // Debugging
  //   }, (error) => {
  //     console.error("Error fetching cart data:", error);
  //   });
  // }

  loadCart(): void {
    const userId = Number(localStorage.getItem('userId')); // Convert string to number
    if (userId) {
      this.dataService.getUserCart(userId).subscribe(
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

  increaseQuantity(index: number): void {
    this.cartItems[index].quantity++;
    this.updateCartItem(this.cartItems[index]);
  }

  decreaseQuantity(index: number): void {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity--;
      this.updateCartItem(this.cart[index]);
    }
  }

  removeFromCart(index: number): void {
    const itemId = this.cart[index].id;
    this.dataService.removeFromCart(itemId).subscribe(() => {
      this.cart.splice(index, 1);
    });
  }

  updateCartItem(item: any): void {
    this.dataService.updateCartItem(item.id, item).subscribe();
  }

  getTotalForItem(item: any): number {
    return item.quantity * item.price;
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + this.getTotalForItem(item), 0);
  }
  

  checkoutCart(): void {
    this.dataService.checkoutCart().subscribe(() => {
      this.cart = [];
    });
  }

  getTotalQuantity(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalAmount(): number {
    let total = this.cartItems.reduce((sum, item) => {
      console.log("Item Price:", item.price, "Quantity:", item.quantity);
      return sum + Number(item.price) * item.quantity;
    }, 0);
  
    console.log("Total Calculated:", total);
    return total;
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

   // Filters only orders with status === 'Processing'
   getProcessingOrders() {
    return this.orders.filter(order => order.status === 'Processing');
  }

  // Increase quantity
  // increaseQuantity(index: number) {
  //   const processingOrders = this.getProcessingOrders();
  //   const order = processingOrders[index];
  //   if (order) {
  //     order.quantity++;
  //   }
  // }

  // // Decrease quantity (removes item if quantity reaches 0)
  // decreaseQuantity(index: number) {
  //   const processingOrders = this.getProcessingOrders();
  //   const order = processingOrders[index];
  //   if (order && order.quantity > 1) {
  //     order.quantity--;
  //   } else {
  //     this.removeFromCart(index);
  //   }
  // }

  // // Remove item from cart
  // removeFromCart(index: number) {
  //   const processingOrders = this.getProcessingOrders();
  //   const orderToRemove = processingOrders[index];

  //   // Find actual index in `orders` array
  //   const actualIndex = this.orders.findIndex(order => order === orderToRemove);
  //   if (actualIndex !== -1) {
  //     this.orders.splice(actualIndex, 1);
  //   }
  // }

  // Calculate total quantity of items in the cart
  // getTotalQuantity() {
  //   return this.getProcessingOrders().reduce((total, order) => total + order.quantity, 0);
  // }

  addToCart(productId: number) {
    this.dataService.addToCart(productId).subscribe(response => {
      console.log("Product added to cart", response);
    });
  }

  checkout() {
    this.dataService.checkoutCart().subscribe(response => {
      console.log("Order placed successfully", response);
    });
  }  
  
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

