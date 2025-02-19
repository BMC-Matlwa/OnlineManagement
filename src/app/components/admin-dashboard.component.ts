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

  orders: any[] = [];
  data: any[] = []; // Array to hold fetched data
  newItem: any = {
    name: '',
    stock: null,
    price: null,
    description: null
  }; // For new item data binding
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
  
  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {}


  ngAfterViewInit(): void {
    this.fetchOrders(); // Load orders when the component initializes
    this.fetchData();
    // Assuming the user ID is available after login (either from a service or localStorage)
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10); // Retrieve the user ID
    this.userRole = localStorage.getItem('userRole')  || ''; // Retrieve the user role
    
    //get orders and username
    this.dataService.getOrders().subscribe((response) => {
      this.orders = response;
    });

    //read tab query and select appropriate tab for home redirection
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
  this.sumApprovedOrders = this.orders
    .filter(order => order.status === 'Approved')
    .reduce((sum, order) => sum + (order.quantity || 0), 0);

  this.sumDeclinedOrders = this.orders
    .filter(order => order.status === 'Declined')
    .reduce((sum, order) => sum + (order.quantity || 0), 0);

  this.sumPendingOrders = this.orders
    .filter(order => order.status === 'Pending')
    .reduce((sum, order) => sum + (order.quantity || 0), 0);

  this.sumAllOrders = this.orders
    .reduce((sum, order) => sum + (order.quantity || 0), 0); 
  // Store the sums in localStorage for persistence
  localStorage.setItem('approvedOrdersSum', this.sumApprovedOrders.toString());
  localStorage.setItem('declinedOrdersSum', this.sumDeclinedOrders.toString());
  localStorage.setItem('pendingOrdersSum', this.sumPendingOrders.toString());
  localStorage.setItem('allOrdersSum', this.sumAllOrders.toString());
}

calculateSum(status: string): number {
  return this.orders
    .filter(order => order.status === status)
    .reduce((sum, order) => sum + (order.quantity || 0), 0);
}

  formatOrderDate(orderDate: string): string {
    const date = new Date(orderDate);
    return date.toLocaleString(); // You can customize the format here
  }

  fetchOrders(): void {
    this.dataService.getOrders().subscribe(
      (response) => {
        this.orders = response;
        console.log('Orders fetched:', this.orders);
        this.calculateOrderSums();
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  calculateSumOfApprovedOrders(): void {
    this.sumApprovedOrders = this.orders
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

  addProductData() {
    const orderData = {
      name: this.newItem.name,
      stock: this.newItem.stock,
      price: this.newItem.price,
      description: this.newItem.description
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
        this.newItem = { name: '', stock: null, price: null }; // Reset form fields
      }
    );
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
