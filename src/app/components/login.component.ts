// ordering-management-frontend/src/app/components/login.component.ts
import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Import HttpClientModule
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog.component';  // Adjust the path


@Component({
    selector: 'app-login',
    standalone: true, 
    imports: [HttpClientModule, FormsModule,CommonModule], // Add HttpClientModule here
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = { email: '', password: '' };
  errorMessage = '';
  resetEmail: string = '';

  constructor(private http: HttpClient, private router: Router, private dataService: DataService, private dialog: MatDialog) {}

  loginUser() {
    this.http.post<any>('http://localhost:3000/api/login', this.user)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          localStorage.setItem('userId', response.user.id); //store user info for table insert
          localStorage.setItem('userRole', response.user.role); //store user role for access rights
          // Redirect to home page
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error logging in:', error);
          this.errorMessage = error.error?.message || 'An error occurred during login.';
        }
      });
  }
  

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // openForgotPassword() {
  //   const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
  //     width: '400px',
  //     data: { email: this.email }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log('Password reset email sent to:', result);
  //     }
  //   });
  // }
  // openForgotPasswordModal() {
  //   const email = prompt('Enter your email for password reset:');
  //   if (email) {
  //     this.dataService.forgotPassword(email).subscribe(
  //       (response) => {
  //         alert('Password reset link sent to your email.');
  //       },
  //       (error) => {
  //         console.error('Error sending reset link:', error);
  //         this.errorMessage = 'Failed to send reset link. Please try again.';
  //       }
  //     );
  //   }
  // }

  // openForgotPasswordModal(): void {
  //   const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
  //     width: '400px',  // Optional dialog width
  //   });

  //   dialogRef.afterClosed().subscribe((result: string) => {
  //     console.log('The dialog was closed, result:', result);
  //   });
  // }

  openForgotPasswordModal(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent);

    dialogRef.afterClosed().subscribe((result: string) => {
      console.log('The dialog was closed, result:', result);
    });
  }
}

