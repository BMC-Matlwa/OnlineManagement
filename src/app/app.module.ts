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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    HomeComponent,
    AdminDashboardComponent  // Components should be in declarations
  ],
  imports: [
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    HomeComponent  // FormsModule should be in imports
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
