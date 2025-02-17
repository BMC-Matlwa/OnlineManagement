// ordering-management-frontend/src/app/components/register.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';  // For redirecting after successful registration
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = { 
    name: '', 
    email: '', 
    password: '',
    role: 'user',
    key: ''
  }

  constructor(private http: HttpClient, private router: Router) {}

  registerUser() {
    if (this.user.role === 'admin') {
      const adminKey = prompt('Enter the admin key:');
      if (adminKey) {
        this.user.key = adminKey;
      } else {
        alert('Admin key is required for admin registration.');
        return;
      }
    }
    
    this.http
      .post('http://localhost:3000/api/register', this.user)
      .subscribe(
        (response: any) => {
          console.log('User registered successfully:', response);
          alert('Registration successful! Redirecting to login...');
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error registering user:', error);
          alert('Registration failed. Please try again.');
        }
      );
  }
}
 
  