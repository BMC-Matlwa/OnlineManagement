import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module'; 
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DashboardComponent } from './components/dashboard.component';
import { HomeComponent } from './components/home.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { DataService } from './data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { UserDetailsComponent } from './components/user-details.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ForgotPasswordDialogComponent } from './components/forgot-password-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ForgotPasswordComponent } from './components/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
// import { RouterModule } from '@angular/router';
import { ValidateEqualDirective } from './validate-equal.directive';
import { NgChartsModule } from 'ng2-charts';
import {AdminAnalyticsComponent} from './components/admin-analytics.component';
import { provideCharts } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    HomeComponent,
    AdminDashboardComponent,
    UserDetailsComponent, 
    ForgotPasswordDialogComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ValidateEqualDirective,
     AdminAnalyticsComponent // Components should be in declarations
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    HomeComponent,
    MatDialogModule,
    BrowserAnimationsModule,
    NgChartsModule
  ],
//   exports: [                 // If you need to use the directive in other modules, export it
//     ValidateEqualDirective,
//     ResetPasswordComponent
//   ],
  providers: [DataService, provideCharts()],
  bootstrap: [AppComponent] //bootstrap: [AppComponent]
})
export class AppModule { }
