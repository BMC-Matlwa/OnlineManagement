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
  showToast = false;
  shippingAddress: string = '';
  orderNumber: string = '';

  constructor(private dataService: DataService, private router: Router) {}
  

  ngOnInit(): void {
    // this.fetchOrders();
    this.loadCart();
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
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

  increaseQuantity(index: number) {
    const item = this.cart[index];
    item.quantity++;  // Update UI first
  
    this.dataService.updateCartQuantity(item.id, item.quantity).subscribe(() => {
      console.log('Quantity increased in DB');
      location.reload(); //reload the whole page
    }, error => {
      console.error('Error updating quantity', error);
    });
  }
  

  decreaseQuantity(index: number): void {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity--;
      this.updateCartItem(this.cart[index]);
      location.reload(); //reload the whole page
    }
  }

  removeFromCart(index: number) {
    const item = this.cart[index];
  
    this.dataService.removeCartItem(item.id).subscribe(() => {
      this.cart.splice(index, 1);  // Update UI after DB update
      console.log('Item removed from cart in DB');
      location.reload(); //reload the whole page
    }, error => {
      console.error('Error removing item', error);
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
  

  checkoutCart(userId: number): void {
    if (!this.shippingAddress) {
      alert('Please enter your address before purchasing.');
      return;
    }
  
    console.log('Purchasing with address:', this.shippingAddress);
  
    const purchaseData = {
      userId: userId,
      cart: this.cart,
      address: this.shippingAddress
    };

    this.dataService.checkoutCart(purchaseData).subscribe(
      (response) => {
        console.log("Checkout successful:", response);
        //alert(`Order placed successfully! Your order number is: ${response.orderNumber}`);
        // alert("Purchase successful!");
      // // this.cart = [];
      // this.loadCart(); // Refresh cart
      this.orderNumber = response.orderNumber; //store  orderNumber
      this.showToast = true;
      // Delay page reload by 10 seconds
      setTimeout(() => {
        location.reload();
      }, 3000); 
          setTimeout(() => this.showToast = false, 3000); // Hide after 10 seconds
          },
        (error) => {
          console.error("Checkout failed:", error);
          alert("Checkout failed. See console for details.");
        }
        );
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
        location.reload(); //reload the whole page
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

  addToCart(productId: number) {
    this.dataService.addToCart(productId).subscribe(response => {
      console.log("Product added to cart", response);
      location.reload(); //reload the whole page
    });
  }

  // checkout() {
  //   const userId = Number(localStorage.getItem('userId'));
  //   this.dataService.checkoutCart(userId).subscribe(response => {
  //     console.log("Order placed successfully", response);
  //     location.reload(); //reload the whole page
  //   });
  // }  
  
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

