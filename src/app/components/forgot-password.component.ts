import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';

  constructor(private dataService: DataService) {}


  onSubmit(): void {
    if (!this.email.includes('@')) {
      this.message = "Please enter a valid email";
      return;
    }

    this.dataService.resetPassword1(this.email).subscribe(
      response => this.message = response.message,
      error => this.message = "Email specified doesn't exist."
    );
  }

  // onSubmit(): void {
  //   if (!this.email || !this.email.includes('@')) {
  //     this.message = 'Please provide a valid email address.';
  //     return;
  //   }
  //   // Call API to reset password
  //   this.dataService.resetPassword(this.email).subscribe(
  //     (response) => {
  //       this.message = 'A password reset link has been sent to your email.';
  //     },
  //     (error) => {
  //       this.message = 'There was an error processing your request.';
  //     }
  //   );
  // }
}
