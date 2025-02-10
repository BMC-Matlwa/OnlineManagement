import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

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

  updateData(id: number, updatedItem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedItem);  // Update data
  }

  deleteData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);  // Delete data
  }

  getUserInfo(userId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/users/${userId}`);
  }
}
