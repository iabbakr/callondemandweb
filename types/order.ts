// Path: @/types/order.ts

export type ServiceCategory = 'food' | 'laundry' | 'logistics' | 'hotel' | 'shop';

export type OrderStatus = 
  | 'pending_approval' 
  | 'approved'         
  | 'paid'             
  | 'processing'       // Renamed from 'preparing' to match your list
  | 'out_for_delivery' 
  | 'delivered'        
  | 'rejected';        

export interface BaseOrder {
  id: string;
  category: ServiceCategory;
  buyerId: string;
  shopId: string;
  status: OrderStatus;
  totalPrice: number;
  items: any[];
  address: string;
  createdAt: any;
} // <-- Close BaseOrder here

// Now define UnifiedOrder separately
export interface UnifiedOrder extends BaseOrder {
  customerName?: string;
  // This now inherits 'id', 'status', etc., from BaseOrder
}