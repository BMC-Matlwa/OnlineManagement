
// ordering-management-frontend/src/app/routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DashboardComponent } from './components/dashboard.component';
import { HomeComponent } from './components/home.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { UserDetailsComponent } from './components/user-details.component';
import { UserRegisteredComponent } from './components/user-registered.component';
import { ForgotPasswordDialogComponent } from './components/forgot-password-dialog.component';
import { ForgotPasswordComponent } from './components/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { OrderCartComponent } from './components/order-cart.component';
import { OrderHistoryComponent } from './components/order-history.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'user-details', component: UserDetailsComponent},
  { path: 'users-registered', component: UserRegisteredComponent},
  // { path: 'reset-password', component: ForgotPasswordDialogComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password/:token', component: ResetPasswordComponent},
  { path: 'View-cart', component: OrderCartComponent},
  {path: 'order-history', component: OrderHistoryComponent}
];