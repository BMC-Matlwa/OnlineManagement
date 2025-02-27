import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DashboardComponent } from './components/dashboard.component';
import { HomeComponent } from './components/home.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { UserDetailsComponent } from './components/user-details.component';
import { ForgotPasswordDialogComponent } from './components/forgot-password-dialog.component';
import { ForgotPasswordComponent } from './components/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { OrderCartComponent } from './components/order-cart.component';
import { OrderHistoryComponent } from './components/order-history.component';
import { AdminAnalyticsComponent } from './components/admin-analytics.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'home', component: HomeComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'user-details', component: UserDetailsComponent},
    // { path: 'reset-password', component: ForgotPasswordDialogComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent},
    { path: 'reset-password/', component: ResetPasswordComponent},
    { path: 'View-cart', component: OrderCartComponent},
    {path: 'order-history', component: OrderHistoryComponent},
    {path: 'analysis', component: AdminAnalyticsComponent}
];
