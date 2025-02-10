// ordering-management-frontend/src/app/components/register.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';  // For redirecting after successful registration
import { FormsModule } from '@angular/forms'; 


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = { 
    name: '', 
    email: '', 
    password: '' 
  } 

  constructor(private http: HttpClient) {}

  registerUser() {
    console.log('Registering user:', this.user); // Debugging log
    this.http
      .post('http://localhost:3000/api/register', this.user)
      .subscribe(
        (response: any) => {
          console.log('User registered successfully:', response);
        },
        (error) => {
          console.error('Error registering user:', error);
          alert('Registration failed. Please try again.');
        }
      );
  }
}
 
  
//   constructor(private http: HttpClient, private router: Router) {}

//    // Register the user by making an API call to the backend
//    registerUser() {
//     // Call the registration API
//     this.http.post('http://localhost:3000/api/register', this.user).subscribe(
//       response => {
//         // If registration is successful, navigate to the login page or show success message
//         console.log('User registered successfully:', response);
//         alert('User registered successfully!');
//         this.router.navigate(['/']);  // Navigate to the login page after registration
//       },
//       error => {
//         // Handle registration error
//         console.error('Error registering user:', error);
//         alert('Error registering user');
//       }
//     );
//   }
// }