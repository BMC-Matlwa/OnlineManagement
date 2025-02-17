import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
// import { AppModule } from '../app.module';
import { ValidateEqualDirective } from '../validate-equal.directive';


@Component({
  selector: 'app-reset-password',
   standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  token: string = ''; // token: string | null = '';
  message: string = '';
  confirmPassword: string = ''; 
  

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    // this.token = this.route.snapshot.queryParamMap.get('token');
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token') ?? ''; // Ensure token is a string
    });
  }

  // resetPasswordForm = {
  //   invalid: false, // You should replace this with actual form validation logic
  // };
  onSubmit(): void {
    if (!this.newPassword) {
      this.message = "Password cannot be empty";
      return;
    }

    this.dataService.updatePassword(this.token, this.newPassword).subscribe(
      response => {
        this.message = response.message;
        setTimeout(() => this.router.navigate(['']), 2000);
      },
      error => this.message = "Error resetting password"
    );
  }

//   resetPassword(form: NgForm) {
//     console.log('New Password:', this.newPassword);
//   console.log('Confirm Password:', this.confirmPassword);
//     // Check if the passwords match
//     if (this.newPassword !== this.confirmPassword) {
//       this.message = 'Passwords do not match.';
//       return;
//     }

//     // Proceed with your reset password logic (e.g., call a service to reset password)
//     this.message = 'Password reset successful!';
//   }
// }
resetPassword(form: any) {
  if (this.newPassword !== this.confirmPassword) {
    this.message = "Passwords do not match";
    return;
  }

  const payload = {
    token: this.token, 
    newPassword: this.newPassword
  };

  this.dataService.resetPassword(payload).subscribe(
    response => {
      this.message = "Password reset successful!";
      setTimeout(() => {
        this.router.navigate(['']);
      }, 2000);
    },
    error => {
      this.message = "Error resetting password: " + error.error.message;
    }
  );
}
}
