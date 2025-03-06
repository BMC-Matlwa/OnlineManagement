import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  
import { NavbarComponent } from '../components/navbar.component'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit{
  allOrders: any[] = [];
  orders: any[] = []; //to view user orders
  ordersADM: any[] = []; //to view user orders
  allordersADM: any[] = []; //to view user orders
  products: any[] = [];
  userId!: number; // Definite assignment assertion
  userRole: string = '';
  groupedOrders: any[] = [];
  sumApprovedOrders: number = 0;
  sumDeclinedOrders: number = 0;
  sumPendingOrders: number = 0;
  sumAllOrders: number = 0;
  sortedOrders: any[] = [];
  sortColumn: string = ''; // Column being sorted
  sortDirection: 'asc' | 'desc' = 'asc'; // Sorting or
  searchQuery: string = '';
  data: any[] = []; // Array to hold fetched data

  constructor(private dataService: DataService, private router: Router) {}
  

  ngOnInit(): void {
    this.fetchOrders();
    this.fetchOrdersADM();
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
    this.userRole = localStorage.getItem('userRole')  || ''; // Retrieve the user role

    //get orders and username
    this.dataService.getOrders().subscribe((response) => {
      this.orders = response;
    });
    this.groupedOrders = this.groupOrdersByDate(this.orders);
}

fetchOrders(): void {
  const userId = this.getLoggedInUserId(); 
  if (userId) {
    this.dataService.getOrdersByUser(userId).subscribe(
      (response) => {
        this.allOrders = response;
        this.orders = [...this.allOrders]
        console.log('Orders fetched for user:', this.allOrders);
        this.groupedOrders = this.groupOrdersByDate(response);
      },
      (error) => {
        console.error('Error fetching orders for user:', error);
      }
    );
  } else {
    console.error('User not logged in');
  }
}


  searchOrders(): void {
    console.log("Search Query:", this.searchQuery); // Debugging
    if (this.searchQuery.trim() === '') {
      this.sortedOrders = [...this.ordersADM]; // Reset if search is empty
    } else {
      const query = this.searchQuery.toLowerCase();

      this.sortedOrders = this.ordersADM.filter(order =>
      order.order_number?.toLowerCase().includes(query) ||
      order.product_name?.toLowerCase().includes(query) ||
      order.name?.toLowerCase().includes(query) ||
      order.address?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
      );
    }
    console.log("Filtered Orders:", this.sortedOrders); // Debugging
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

  // groupOrdersByDate(orders: any[]): any {
  //   return orders.reduce((acc, order) => {
  //     const date = this.formatOrderByDate(order.order_date);
  //     if (!acc[date]) {
  //       acc[date] = [];
  //     }
  //     acc[date].push(order);
  //     return acc;
  //   }, {});
  // }

  groupOrdersByDate(orders: any[]): any {
    // Sort orders by order_date DESC (newest first)
    const sortedOrders = orders.sort(
      (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  
    console.log("Sorted Orders:", sortedOrders); // Debugging: Check the output
  
    return sortedOrders.reduce((acc, order) => {
      const date = this.formatOrderByDate(order.order_date);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});
  }

  sortByDescending(a: any, b: any) {
    return b.key.localeCompare(a.key); // Ensures descending order
  }
  
  
  formatOrderByDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  //ADMINS SIDE

  loadStoredSums(): void {
    //calculate the sum of orders approved and record the last sum.
    const storedSum = localStorage.getItem('approvedOrdersSum');
    const declinedSum = localStorage.getItem('declinedOrdersSum');
    const pendingSum = localStorage.getItem('pendingOrdersSum');
    const allSum = localStorage.getItem('allOrdersSum');
    if (storedSum) {
      this.sumApprovedOrders = parseInt(storedSum, 10);
    } else {
      this.calculateSumOfApprovedOrders();
    }
    this.sumApprovedOrders = storedSum ? parseInt(storedSum, 10) : 0;
    this.sumDeclinedOrders = declinedSum ? parseInt(declinedSum, 10) : 0;
    this.sumPendingOrders = pendingSum ? parseInt(pendingSum, 10) : 0;
    this.sumAllOrders = allSum ? parseInt(allSum, 10) : 0;
  
    if (!storedSum || !declinedSum || !pendingSum) {
      this.calculateOrderSums();
    }
  }
  
  calculateOrderSums(): void {
    this.sumApprovedOrders = this.ordersADM
      .filter(order => order.status === 'Approved').length;
      // .reduce((sum, order) => sum + (order.quantity || 0), 0);
  
    this.sumDeclinedOrders = this.ordersADM
      .filter(order => order.status === 'Declined').length;
      // .reduce((sum, order) => sum + (order.quantity || 0), 0);
  
    this.sumPendingOrders = this.ordersADM
      .filter(order => order.status === 'Processing').length;
      // .reduce((sum, order) => sum + (order.quantity || 0), 0);
  
    this.sumAllOrders = this.ordersADM.length;
      // .reduce((sum, order) => sum + (order.quantity || 0), 0); 
    // Store the sums in localStorage for persistence
    localStorage.setItem('approvedOrdersSum', this.sumApprovedOrders.toString());
    localStorage.setItem('declinedOrdersSum', this.sumDeclinedOrders.toString());
    localStorage.setItem('pendingOrdersSum', this.sumPendingOrders.toString());
    localStorage.setItem('allOrdersSum', this.sumAllOrders.toString());
  }
  
  calculateSum(status: string): number {
    return this.ordersADM
      .filter(order => order.status === status)
      .reduce((sum, order) => sum + (order.quantity || 0), 0);
  }
  
  // Sort function triggered by button clicks
  sortOrders(): void {
    this.sortedOrders = [...this.ordersADM].sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];
  
      if (typeof valueA === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  }
  
  // Set sorting column and toggle direction
  setSorting(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortOrders();
  }
  
    calculateSumOfApprovedOrders(): void {
      this.sumApprovedOrders = this.ordersADM
      .filter(order => order.status === 'Approved') // Only include orders that are approved
      .reduce((sum, order) => sum + (order.quantity || 0), 0);
  
      localStorage.setItem('approvedOrdersSum', this.sumApprovedOrders.toString());
  
      console.log(`Sum of approved orders: ${this.sumApprovedOrders}`);
    }
  
    approveOrder(order: any): void {
      // const productName = order.name;
  
      this.dataService.updateOrderStatus(order.id, 'Approved').subscribe(
        (response) => {
          console.log('Order approved:', response);
          location.reload(); //reload the whole page
          order.status = 'Approved';
          console.log(`Updated status to Approved for: ${order.product_name}`);
          this.calculateSumOfApprovedOrders();
  
  
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
          location.reload(); //reload the whole page
          order.status = 'Declined';
          this.calculateSumOfApprovedOrders();
  
  
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
    
    fetchOrdersADM(): void {
      this.dataService.getOrders().subscribe(
        (response) => {
          this.ordersADM = response;
          console.log('Orders fetched:', this.ordersADM);
          this.sortedOrders = [...this.ordersADM]; // Initialize sorted list
          this.orders = [...this.sortedOrders]; 
          this.sortOrders(); // Apply default sor
          this.calculateOrderSums();
          // this.searchOrders();
        },
        (error) => {
          console.error('Error fetching orders:', error);
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
  
    downloadPDF() {
      const doc = new jsPDF();
    
      // Title
      doc.setFontSize(18);
      doc.text('Order Summary Report', 14, 15);
    
      // Add Date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.text(`Report Date: ${currentDate}`, 14, 25);
    
  
  
    // Convert table to PDF format
    autoTable(doc, {
      head: [['Product Name', 'Quantity', 'Status', 'Order Date', 'Ordered By']],
      body: this.orders.map(order => [
        order.product_name,
        order.quantity,
        order.status,
        this.formatOrderDate(order.order_date),
        order.name
      ]),
      startY: 35, // Ensure the table starts after the order summary
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    
       // Order Summary
       const summaryY = finalY + 15;
       doc.setFontSize(14);
       doc.text('Order Summary:', 14, summaryY);
       
       doc.setFontSize(12);
       doc.text(`Approved Orders: ${this.sumApprovedOrders}`, 14, summaryY + 10);
       doc.text(`Declined Orders: ${this.sumDeclinedOrders}`, 14, summaryY + 20);
       doc.text(`Pending Orders: ${this.sumPendingOrders}`, 14, summaryY + 30);
       doc.text(`Total Orders: ${this.sumAllOrders}`, 14, summaryY + 40);
      // Save the PDF
      doc.save(`orders_${currentDate.replace(/\//g, '-')}.pdf`);
    }
}
