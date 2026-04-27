// src/hooks/useStore.ts
import { useState, useEffect } from 'react';
import { store, Order } from '../store/AppStore';

export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  useEffect(() => store.subscribe(() => setOrders(store.getOrders())), []);
  return orders;
}

export function useOrder(id: string): Order | undefined {
  const [order, setOrder] = useState<Order | undefined>(store.getOrder(id));
  useEffect(() => store.subscribe(() => setOrder(store.getOrder(id))), [id]);
  return order;
}