import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:3000/api/data';  // URL to the backend API

  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);  // Fetch data from backend
  }

  addData(newItem: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, newItem);  // Add new data
  }

  updateData(id: number, editingItem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, editingItem);  // Update data
  }

  deleteData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);  // Delete data
  }

  getUserInfo(userId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/users/${userId}`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/orders');
  }
  
  // updateOrderStatus(orderId: number, status: string): Observable<any> {
  //   return this.http.put(`http://localhost:3000/api/orders/${orderId}/status`, { status });
  // }
  updateOrderStatus(orderId: number, status: string, updatedBy: number): Observable<any> {
    return this.http.put(`http://localhost:3000/api/orders/${orderId}/status`, { 
      status, 
      updated_by: updatedBy // Include updated_by
    });
  }
  
  
  placeOrder(order: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/orders', order);
  }
  
  
  getUserOrders(userId: number) {
    return this.http.get<any[]>(`http://localhost:3000/api/orders/user/${userId}`);
  }
  
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/api/products');
  }
  
  getProductById(productId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/products/${productId}`);
  }

  updateProductStock(productId: string, newStock: number): Observable<any> {
    return this.http.put<any>(`http://localhost:3000/api/products/${productId}/stock`, { stock: newStock });
  }

  addProduct(orderData: any): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/productsData/`, orderData);  // Add new data
  }
  getProductByName(productName: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/products/name/${productName}`);
  }
  
  getOrdersByUser(userId: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/orders/user/${userId}`);
  }

  getProfile(userId: number): Observable<any> {
    // Replace the URL with your real API endpoint
    return this.http.get<any>(`http://localhost:3000/api/profile/${userId}`);
  }
  
  updateProfile(userId: number, profileData: any): Observable<any> {
    // Replace the URL with your real API endpoint
    return this.http.put<any>(`http://localhost:3000/api/profile/${userId}`, profileData);
  }

  updateUser(userId: number, userData: any):  Observable<any> {
    return this.http.put(`http://localhost:3000/api/users/${userId}`, userData);
  }
  
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/users`);
  }
  
    updateUserP(userId: number, userData: any):  Observable<any> {
      return this.http.put(`http://localhost:3000/api/user/${userId}`, userData);
    }

  forgotPassword(email: string) { //forgot-password-dialog
    const url = 'http://localhost:3000/api/forgot-password'; // Replace with your actual API endpoint
    return this.http.post(url, { email });
  }
  
  resetPassword1(email: string): Observable<any> {
    return this.http.post(`http://localhost:3000/reset-password`, { email });
  }

  resetNewUser(email: string): Observable<any> {
    return this.http.post(`http://localhost:3000/reset-NewUser`, { email });
  }

  resetPassword(payload: { token: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/reset-password/confirm`, payload);
  }
  

  updatePassword(token: string | null, newPassword: string): Observable<any> {
    return this.http.post('http://localhost:3000/update-password', { token, newPassword });
  }
  
  registerUser(userData: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/register', userData);
  }
  
  // Fetch cart items
  getCart(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/cart/`);
  }

  // Add product to cart with status 'Pending Checkout'
  addToCart(product: any): Observable<any> {
    const cartItem = { ...product, status: 'Pending Checkout' };
    return this.http.post<any>(`http://localhost:3000/api/cart`, cartItem);
  }

  // Update cart item quantity
  updateCartItem(id: number, updatedItem: any): Observable<any> {
    return this.http.put<any>(`http://localhost:3000/api/cart/${id}`, updatedItem);
  }

  // Remove item from cart
  removeFromCart(id: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:3000/api/cart/${id}`);
  }

  // Checkout: Move items from cart to orders
  // checkoutCart(userId: number): Observable<any> {
  //   return this.http.post<any>(`http://localhost:3000/api/checkout/${userId}`, {user_id: userId});
  // }
  checkoutCart(purchaseData: { userId: number; cart: any[]; address: string }) {
    return this.http.post<any>(`http://localhost:3000/api/checkout/${purchaseData.userId}`, (purchaseData));
  }

  addNewUser(newUser: { name: string; email: string; role: string; phone: string; password: string; created_by: number; }) {
    return this.http.post(`http://localhost:3000/api/register/${newUser.created_by}`, (newUser));
  }
  
  getUserCart() {
    return this.http.get<any[]>(`http://localhost:3000/api/cart/`);
  }

  getUserCartCheckout(userId: number) {
    return this.http.get<any[]>(`http://localhost:3000/api/cart/${userId}`);
  }

  updateCartQuantity(cartId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`http://localhost:3000/api/cart/${cartId}`, { quantity });
  }
  
  removeCartItem(cartId: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:3000/api/cart/${cartId}`);
  }
  









}
