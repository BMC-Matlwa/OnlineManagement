import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DashboardComponent } from './components/dashboard.component';
//import { HomeComponent } from './components/home.component';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent }
  //{ path: 'home', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule, FormModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
