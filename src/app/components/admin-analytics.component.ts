import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../components/navbar.component'; 
// import { NgChartsModule } from 'ng2-charts';
import { DataService } from '../data.service'; 
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart, ChartData, ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';




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

  orderChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 22, // Increase legend label size
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 20 },
        formatter: (value: number) => value // Show actual order count
      }
    }
  };

  userChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 22, // Increase legend label size
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: { 
          weight: 'bold', 
          size: 20 // Increase data label size
        },
        formatter: (value: number) => value, // Show actual count inside the chart
      }
    }
  };
  

  // stockChartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: {
  //     legend: { position: 'top' },
  //     datalabels: {
  //       color: '#fff',
  //       font: { weight: 'bold', size: 10 },
  //       formatter: (value: number) => value // Show actual order count
  //     }
  //   }
  // };

  stockChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 10 },
        formatter: (value: number) => value // Show actual order count
      }
    }
  };

  // stockChartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //       labels: {
  //         font: {
  //           size: 18, // Increase legend label size
  //         },
  //       },
  //     },
  //     datalabels: {
  //       color: '#fff',
  //       font: { 
  //         weight: 'bold', 
  //         size: 14 // Increase data label size
  //       },
  //       formatter: (value: number) => value, // Show actual order count
  //     }
  //   },
  //   scales: {
  //     x: {
  //       ticks: {
  //         font: {
  //           size: 14, // Increase x-axis label size
  //         },
  //       },
  //       title: {
  //         display: true,
  //         text: 'Product Categories', // X-axis title
  //         font: {
  //           size: 16, // Increase x-axis title size
  //         },
  //       },
  //     },
  //     y: {
  //       ticks: {
  //         font: {
  //           size: 14, // Increase y-axis label size
  //         },
  //       },
  //       title: {
  //         display: true,
  //         text: 'Stock Count', // Y-axis title
  //         font: {
  //           size: 16, // Increase y-axis title size
  //         },
  //       },
  //     },
  //   },
  // };
  
  
  

  orderChartLabels: string[] = ['Approved', 'Processing', 'Declined'];
  userChartLabels: string[] = ['user', 'admin', 'Inactive']
  orderChartData!: ChartData<'pie'>;
  userChartData!: ChartData<'doughnut'>;
  stockChartData!: ChartData<'bar'>;

  // orderChartType: ChartType = 'pie';
  orderChartType: 'pie' = 'pie'; 

  userChartType:  'doughnut' = 'doughnut';
  stockChartType: 'bar' = 'bar';

  orderChartPlugins = [ChartDataLabels];
  userChartPlugins = [ChartDataLabels];
  stockChartPlugins = [ChartDataLabels];

  constructor(private dataService: DataService,private router: Router ) {}

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
    const statuses = ['Approved', 'Processing', 'Declined'];
    const counts = statuses.map(status =>
      this.orders.filter(order => order.status === status).length
    );

    this.orderChartData = {
      labels: statuses,
    //   datasets: [{ data: counts, label: 'Orders' }]
    // };
    datasets: [
      {
        data: counts,
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'], // Green, Yellow, Red
        hoverOffset: 10,
        hoverBackgroundColor: ['#28f32e', '#fbff00',' #ff3718']
      }
    ]
  };
  }

  prepareUserChart(): void {
    // const genders = ['Male', 'Female'];
    const roles = ['user', 'admin', 'Inactive'];
    const counts = roles.map(role =>
      this.users.filter(user => user.role === role).length
    );

    this.userChartData = {
      labels: roles,
      datasets: [
        {
          data: counts,
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336'], // Green, Yellow, Red
          hoverOffset: 30,
          hoverBackgroundColor: ['#28f32e', '#fbff00',' #ff3718']
        }
      ]
    };
  }

  prepareStockChart(): void {
    const labels = this.products.map(product => product.name);
    const counts = this.products.map(product => product.stock);

    this.stockChartData = {
      labels: labels,
      datasets: [
        { 
          data: counts, 
          label: 'Stock on Hand',
          backgroundColor: ['#4CAF50'],
          hoverBackgroundColor: ['#28f32e']
        }
      ]
    };
  }

  userDetails(){
    window.location.href = '/users-registered';
  }

  orderDetails(){
    window.location.href = '/order-history';
  }

  productDetails(){
    window.location.href = '/admin';
  }
}
