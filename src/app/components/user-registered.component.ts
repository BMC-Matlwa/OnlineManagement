import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Product } from '../product.model'; 
import { NavbarComponent } from '../components/navbar.component'; 

@Component({
  selector: 'app-user-registered',
  standalone: true,
  imports: [CommonModule, FormsModule,NavbarComponent],
  templateUrl: './user-registered.component.html',
  styleUrl: './user-registered.component.css'
})
export class UserRegisteredComponent {

  allUsers: any[] = [];
  users: any[] = [];
  currentPage = 1;
  itemsPerPage = 7; 
  totalItems: number = this.users.length;
  searchQuery: string = '';
  showToast = false;
  showAddUserForm: boolean = false;
  newUser = {
    name: '',
    email: '',
    role: 'User',
    phone: ''
  };
  newItem = {
    name: '',
    email: '',
    role: 'User',
    phone: '',
    password: ''
  };


  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.totalItems = this.users.length; //totalItems is recalculated when users are initialized.
    console.log('users count:', this.users.length);
  }

  getAllUsers(): void {
    this.dataService.getUsers().subscribe(
      (response) => {
        this.allUsers = response;
       // this.users = response;
       this.users = [...this.allUsers];
        
        this.totalItems = this.users.length;
        this.updatePagination();
        console.log("Fetched Users:", this.allUsers); // Debugging
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }  

  searchUsers(): void {
    console.log("Search Query:", this.searchQuery); // Debugging
    if (this.searchQuery.trim() === '') {
      this.users = [...this.allUsers]; // Reset if search is empty
    } else {
      const query = this.searchQuery.toLowerCase();
      this.users = this.allUsers.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1; // Reset pagination
    this.totalItems = this.users.length; // Update total items count
    this.updatePagination();
    console.log("Filtered Users:", this.users); // Debugging
  }

  updatePagination(): void {
    this.totalItems = this.users.length;
  }

   // Get the current page of users
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    console.log('Displaying users from index:', start, 'to', end);
    return this.users.slice(start, end);
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

  
  formatOrderDate(orderDate: string): string {
    const date = new Date(orderDate);
    // return date.toLocaleString(); // You can customize the format here
    const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }

  toggleEdit(user: any): void {
    user.editMode = true;
  }
  
  saveUser(user: any): void {
    this.dataService.updateUserP(user.id, user).subscribe(
      () => {
        // alert('User updated successfully!');
        setTimeout(() => {
          location.reload();
        }, 3000); 
            setTimeout(() => this.showToast = false, 3000);
        user.editMode = false;
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }
  
  cancelEdit(user: any): void {
    user.editMode = false;
  }

  toggleAddUserForm(): void {
    this.showAddUserForm = !this.showAddUserForm;
  }

  addUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.phone) {
      alert("Please fill in all fields.");
      return;
    }
    const newUserCopy = { ...this.newUser, editMode: false }; // Clone object
    this.paginatedUsers.push(newUserCopy); // Add to list
    this.newUser = { name: '', email: '', role: 'User', phone: '' }; // Reset form
    this.showAddUserForm = false; // Hide form
  }

  // addProductData() {
  //     const orderData = {
  //       name: this.newItem.name,
  //       email: this.newItem.email,
  //       role: this.newItem.role,
  //       phone: this.newItem.phone,
  //       password: this.newItem.password
  //     };
  
  //     this.dataService.registerUser(orderData).pipe(
  //       catchError((error) => {
  //         console.error('Error adding order:', error);
  //         alert('Failed to add order');
  //         throw error;
  //       })
  //     ).subscribe(
  //       (response) => {
  //         console.log('Order added successfully:', response);
  //         // alert('Order added successfully!');
  //         // location.reload(); //reload the whole page
  //         setTimeout(() => {
  //           location.reload();
  //         }, 3000); 
  //             setTimeout(() => this.showToast = false, 3000); // Hide after 3 seconds
  //         this.newItem = { name: '', email: null, role: null }; // Reset form fields
  //       }
  //     );
  //   }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
