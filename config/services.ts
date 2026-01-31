import { 
  Utensils, Shirt, Truck, ShoppingBag, 
  Smartphone, Zap, Tv, Droplets 
} from "lucide-react";

export const SERVICE_CATEGORIES = {
  FOOD: "food",
  LAUNDRY: "laundry",
  LOGISTICS: "logistics",
  SHOP: "shop",
} as const;

export const APP_MENU = {
  food: {
    title: "Mobile Restaurant",
    tagline: "Local & Continental dishes delivered hot.",
    icon: Utensils,
    themeColor: "text-orange-500",
    items: [
      { id: "f1", name: "Jollof Rice Special", price: 3500, desc: "Served with turkey and plantain" },
      { id: "f2", name: "Pounded Yam & Egusi", price: 4500, desc: "Freshly pounded with assorted meat" },
      { id: "f3", name: "Grilled Chicken Quarter", price: 3000, desc: "Spiced with local herbs" },
    ]
  },
  laundry: {
    title: "Laundry & Dry Cleaning",
    tagline: "Premium care for your everyday wear.",
    icon: Shirt,
    themeColor: "text-blue-500",
    items: [
      { id: "l1", name: "Suit (2-Piece)", price: 5000, desc: "Dry cleaned and steam pressed" },
      { id: "l2", name: "Shirt (Wash & Iron)", price: 1200, desc: "Starch optional" },
      { id: "l3", name: "Duvet / Blanket", price: 4500, desc: "Deep cleaned and sanitized" },
    ]
  },
  logistics: {
    title: "Instant Delivery",
    tagline: "Send packages across the city safely.",
    icon: Truck,
    themeColor: "text-purple-500",
    items: [
      { id: "lo1", name: "Bike Delivery (Small)", price: 1500, desc: "Within 5km radius" },
      { id: "lo2", name: "Car Delivery (Medium)", price: 3500, desc: "Standard city wide" },
    ]
  },
  shop: {
    title: "Grocery & Essentials",
    tagline: "Daily needs delivered to your door.",
    icon: ShoppingBag,
    themeColor: "text-green-500",
    items: [
      { id: "s1", name: "Cooking Oil (5L)", price: 8500, desc: "Premium vegetable oil" },
      { id: "s2", name: "Basmati Rice (5kg)", price: 12000, desc: "Long grain aromatic rice" },
    ]
  }
};

export const UTILITIES_MENU = [
  { id: 'airtime', name: 'Airtime', icon: Smartphone, color: '#2196F3', href: '/utilities/airtime' },
  { id: 'data', name: 'Data Bundle', icon: Zap, color: '#9C27B0', href: '/utilities/data' },
  { id: 'cable', name: 'Cable TV', icon: Tv, color: '#E91E63', href: '/utilities/cable' },
  { id: 'electricity', name: 'Electricity', icon: Droplets, color: '#FF9800', href: '/utilities/electricity' },
];