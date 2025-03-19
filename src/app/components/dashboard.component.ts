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
import { MatDialog } from '@angular/material/dialog';
import { ChatbotComponent } from './chatbot.component';




@Component({
    selector: 'app-dashboard',
    standalone: true,
        imports: [MatTabsModule,
          MatTableModule,
          MatButtonModule,CommonModule, FormsModule, NavbarComponent, ChatbotComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    
})
export class DashboardComponent implements AfterViewInit {
  allProducts: any[] = [];
  products: any[] = [];
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  orders: any[] = []; //to view user orders
@ViewChild('tabGroup') tabGroup!: MatTabGroup; //to record the tabs
  selectedTabIndex = 0;
  currentPage = 1;
  itemsPerPage = 7; 
  totalItems: number = this.products.length;
  searchQuery: string = '';
  selectedProduct: any = null;
  product: any;
  images: string[] = [];
  currentSlide: number = 0;
  image_url?: string;
  image2?: string;
  image3?: string;
  showModal: boolean = false;
  showToast = false;

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {}

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
        this.allProducts = response;
        this.products = [...this.allProducts]

        this.totalItems = this.products.length;
        this.updatePagination();
        console.log("Fetched Users:", this.allProducts);
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
        location.reload(); //reload the whole page
      },
      (error) => {
        console.error('Error placing order:', error);
        alert('Failed to place order.');
      }
    );
  }

  addToCart(product: any): void {
    const userId = this.getLoggedInUserId();
    const quantity = product.orderQuantity;

    if (!quantity || isNaN(+quantity) || +quantity <= 0) { //if quantity is null or not a number or less/= than 0.
      alert('Invalid quantity.');
      return;
    }

    const cartItem = {
      user_id: userId,
      product_id: product.id,
      // product_name: product.name,
      // price: product.price,
      quantity: +quantity
      // status: 'Pending Checkout',
    };

    this.dataService.addToCart(cartItem).subscribe(() => {
      // alert(`${product.name} added to cart!`);
      console.log("user_Id is", userId);
      this.showToast = true;
      // Delay page reload by 10 seconds
setTimeout(() => {
  location.reload();
}, 3000); 
    setTimeout(() => this.showToast = false, 3000); // Hide after 10 seconds
    });
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
  updatePagination(): void {
    this.totalItems = this.products.length;
  }

   // Get the current page of users
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    console.log('Displaying users from index:', start, 'to', end);
    return this.products.slice(start, end);
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
    this.products = [...this.allProducts]; // Reset if search is empty
  } else {
    const query = this.searchQuery.toLowerCase();
    this.products = this.allProducts.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  }
  this.currentPage = 1; // Reset pagination
  this.totalItems = this.products.length; // Update total items count
  this.updatePagination();
  console.log("Filtered Users:", this.products); // Debugging
}

// viewProductDetails(product: any): void {
//   this.dialog.open(ProductDetailsComponent, {
//     width: '400px',
//     data: product
//   });
// }

// openModal(product: any) {
//   this.selectedProduct = product;
// }

// openModal(product: any) {
//   this.selectedProduct = { ...product };

//   // Ensure orderQuantity exists to prevent errors
//   if (!this.selectedProduct.orderQuantity) {
//     this.selectedProduct.orderQuantity = 1;
//   }
// }

openModal(product: any) {
  this.selectedProduct = { 
    ...product,
    images: [product.image_url, product.image2, product.image3].filter(img => img) // Store images in array
  };
  this.currentSlide = 0; // Reset slideshow index
}



closeModal(event: Event) {
  if (event.target === event.currentTarget) {
    this.selectedProduct = null;
  }
}

prevSlide(event: Event) {
  event.stopPropagation(); // Prevent modal close on button click
  this.currentSlide = (this.currentSlide === 0) ? this.selectedProduct.images.length - 1 : this.currentSlide - 1;
}

nextSlide(event: Event) {
  event.stopPropagation();
  this.currentSlide = (this.currentSlide + 1) % this.selectedProduct.images.length;
}
}