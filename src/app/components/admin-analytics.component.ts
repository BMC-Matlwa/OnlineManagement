import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../components/navbar.component'; 
// import { NgChartsModule } from 'ng2-charts';
import { DataService } from '../data.service'; 
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart, ChartData, ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';




@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [NavbarComponent, CommonModule, NgChartsModule],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent implements OnInit{
  orders: any[] = [];
  users: any[] = [];
  products: any[] = [];

  orderChartData!: ChartData<'pie'>;
  userChartData!: ChartData<'doughnut'>;
  stockChartData!: ChartData<'bar'>;

  orderChartType: ChartType = 'pie';
  userChartType: ChartType = 'doughnut';
  stockChartType: ChartType = 'bar';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadUsers();
    this.loadProducts();
  }

  loadOrders(): void {
    this.dataService.getOrders().subscribe(data => {
      this.orders = data;
      this.prepareOrderChart();
    });
  }

  loadUsers(): void {
    this.dataService.getUsers().subscribe(data => {
      this.users = data;
      this.prepareUserChart();
    });
  }

  loadProducts(): void {
    this.dataService.getProducts().subscribe(data => {
      this.products = data;
      this.prepareStockChart();
    });
  }

  prepareOrderChart(): void {
    const statuses = ['Pending', 'Processing', 'Completed'];
    const counts = statuses.map(status =>
      this.orders.filter(order => order.status === status).length
    );

    this.orderChartData = {
      labels: statuses,
      datasets: [{ data: counts, label: 'Orders' }]
    };
  }

  prepareUserChart(): void {
    const genders = ['Male', 'Female'];
    const counts = genders.map(gender =>
      this.users.filter(user => user.gender === gender).length
    );

    this.userChartData = {
      labels: genders,
      datasets: [{ data: counts, label: 'Users' }]
    };
  }

  prepareStockChart(): void {
    const labels = this.products.map(product => product.name);
    const counts = this.products.map(product => product.stock);

    this.stockChartData = {
      labels: labels,
      datasets: [{ data: counts, label: 'Stock on Hand' }]
    };
  }
}
