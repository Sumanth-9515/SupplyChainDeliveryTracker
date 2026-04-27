// src/store/AppStore.ts
export type OrderStatus = 'Open' | 'Accepted' | 'Picked Up' | 'In Transit' | 'Delivered';

export interface TimelineEntry {
  status: string;
  time: string;
  location?: { lat: number; lng: number };
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  items: string[];
  totalAmount: number;
  status: OrderStatus;
  assignedDriverId: string | null;
  driverLocation: { latitude: number; longitude: number; updatedAt: string } | null;
  timeline: TimelineEntry[];
  createdAt: string;
}

const MOCK_ROUTE = [
  { latitude: 17.385044, longitude: 78.486671 },
  { latitude: 17.395044, longitude: 78.496671 },
  { latitude: 17.405044, longitude: 78.506671 },
  { latitude: 17.415044, longitude: 78.516671 },
  { latitude: 17.425044, longitude: 78.526671 },
  { latitude: 17.435044, longitude: 78.536671 },
];

const now = () => new Date().toISOString();
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const initialOrders: Order[] = [
  {
    id: 'ORD001', customerName: 'Arjun Sharma',
    address: '12, Banjara Hills, Hyderabad - 500034',
    items: ['Laptop Stand', 'Wireless Mouse', 'USB Hub'],
    totalAmount: 2450, status: 'Open', assignedDriverId: null, driverLocation: null,
    timeline: [{ status: 'Order Created', time: ago(3600000) }],
    createdAt: ago(3600000),
  },
  {
    id: 'ORD002', customerName: 'Priya Reddy',
    address: '45, Jubilee Hills, Hyderabad - 500033',
    items: ['Office Chair', 'Desk Lamp'],
    totalAmount: 8900, status: 'Open', assignedDriverId: null, driverLocation: null,
    timeline: [{ status: 'Order Created', time: ago(7200000) }],
    createdAt: ago(7200000),
  },
  {
    id: 'ORD003', customerName: 'Kiran Rao',
    address: '7, Madhapur, Hyderabad - 500081',
    items: ['Mechanical Keyboard'],
    totalAmount: 3200, status: 'Open', assignedDriverId: null, driverLocation: null,
    timeline: [{ status: 'Order Created', time: ago(1800000) }],
    createdAt: ago(1800000),
  },
  {
    id: 'ORD004', customerName: 'Meena Iyer',
    address: '22, Kondapur, Hyderabad - 500084',
    items: ['Monitor 27"', 'HDMI Cable', 'Monitor Stand'],
    totalAmount: 15600, status: 'Open', assignedDriverId: null, driverLocation: null,
    timeline: [{ status: 'Order Created', time: ago(900000) }],
    createdAt: ago(900000),
  },
];

type Listener = () => void;

class AppStore {
  private orders: Order[] = initialOrders.map(o => ({ ...o }));
  private listeners: Set<Listener> = new Set();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  getOrders(): Order[] {
    return this.orders.map(o => ({ ...o }));
  }

  getOrder(id: string): Order | undefined {
    const o = this.orders.find(o => o.id === id);
    return o ? { ...o } : undefined;
  }

  acceptOrder(orderId: string, driverId: string) {
    const t = now();
    this.orders = this.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Accepted', assignedDriverId: driverId, timeline: [...o.timeline, { status: 'Accepted', time: t }] }
        : o
    );
    this.notify();
  }

  advanceStatus(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    const t = now();
    const next: Record<string, OrderStatus> = {
      'Accepted': 'Picked Up',
      'Picked Up': 'In Transit',
      'In Transit': 'Delivered',
    };
    const nextStatus = next[order.status];
    if (!nextStatus) return;

    const entry: TimelineEntry = { status: nextStatus, time: t };
    if (nextStatus === 'Picked Up') {
      entry.location = { lat: MOCK_ROUTE[0].latitude, lng: MOCK_ROUTE[0].longitude };
      this._startTracking(orderId);
    }
    if (nextStatus === 'Delivered') {
      this._stopTracking(orderId);
    }

    this.orders = this.orders.map(o =>
      o.id === orderId ? { ...o, status: nextStatus, timeline: [...o.timeline, entry] } : o
    );
    this.notify();
  }

  private _startTracking(orderId: string) {
    if (this.intervals.has(orderId)) return;
    let index = 0;
    const iv = setInterval(() => {
      const order = this.orders.find(o => o.id === orderId);
      if (!order || order.status === 'Delivered') { this._stopTracking(orderId); return; }
      const loc = MOCK_ROUTE[index % MOCK_ROUTE.length];
      this.orders = this.orders.map(o =>
        o.id === orderId ? { ...o, driverLocation: { ...loc, updatedAt: now() } } : o
      );
      index++;
      this.notify();
    }, 5000);
    this.intervals.set(orderId, iv);
  }

  private _stopTracking(orderId: string) {
    const iv = this.intervals.get(orderId);
    if (iv) { clearInterval(iv); this.intervals.delete(orderId); }
  }
}

export const store = new AppStore();