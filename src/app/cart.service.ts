import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = new BehaviorSubject<any[]>([]);
  cart$ = this.cart.asObservable();

  addToCart(product: any) {
    const updatedCart = [...this.cart.getValue(), product];
    this.cart.next(updatedCart);
  }

  getCart() {
    return this.cart$;
  }
}
