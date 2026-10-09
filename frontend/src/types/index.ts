export type UserRole = 'MANAGER' | 'DRIVER' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface Vehicle {
  id: number;
  code: string;
  plate_number: string;
  vehicle_type: string;
  max_capacity_kg: number;
  status: 'NORMAL' | 'AT_RISK' | 'DISRUPTED' | 'RESOLVED' | 'MAINTENANCE';
  current_lat: number;
  current_lng: number;
  current_speed_kmh: number;
  stationary_duration_secs: number;
  driver_name: string;
  route_code: string;
  last_gps_update?: string;
}

export interface Delivery {
  id: number;
  tracking_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  lat: number;
  lng: number;
  items_description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'OUT_FOR_DELIVERY' | 'AT_RISK' | 'DELAYED' | 'DELIVERED';
  original_eta: string;
  estimated_eta: string;
  delay_minutes: number;
  delay_reason?: string;
  vehicle_code: string;
  route_code: string;
}

export interface AIAnalysisData {
  problem_type: string;
  urgency: 'INFO' | 'WARNING' | 'CRITICAL';
  estimated_delay_mins: number;
  confidence: string;
  affected_deliveries_count: number;
  suggested_action: string;
  full_analysis_json?: any;
}

export interface RecommendationPlan {
  id: number;
  option_code: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  title: string;
  description: string;
  cost_inr: number;
  delay_mins: number;
  deliveries_saved: number;
  customer_impact_level: 'Low' | 'Medium' | 'High';
  operational_risk_level: 'Low' | 'Medium' | 'High';
  is_ai_recommended: boolean;
}

export interface Disruption {
  id: number;
  code: string;
  title: string;
  status: 'AT_RISK' | 'ACTIVE' | 'SIMULATING' | 'RESOLVED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  disruption_type: string;
  vehicle_code: string;
  driver_name: string;
  route_code: string;
  stationary_duration_secs: number;
  affected_deliveries_count: number;
  detected_at?: string;
  resolved_at?: string;
  driver_report?: {
    category: string;
    message: string;
    timestamp?: string;
  };
  ai_analysis?: AIAnalysisData;
  recommendations?: RecommendationPlan[];
}

export interface DriverInstruction {
  id: number;
  title: string;
  instruction_type: string;
  body: string;
  avoid_route?: string;
  take_route?: string;
  priority_order?: string;
  new_eta?: string;
  is_acknowledged: boolean;
  created_at?: string;
}

export interface AppNotification {
  id: number;
  target_role: string;
  target_order_id?: string;
  title: string;
  message: string;
  notification_type: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  is_read: boolean;
  created_at?: string;
}

export interface CustomerOrderData {
  tracking_number: string;
  customer_name: string;
  delivery_address: string;
  items_description: string;
  status: string;
  estimated_eta: string;
  original_eta: string;
  delay_minutes: number;
  is_delayed: boolean;
  current_location: {
    lat: number;
    lng: number;
  };
  transparent_update: {
    title: string;
    message: string;
    reason: string;
    updated_arrival: string;
    delay_summary: string;
    explanation: string;
  };
  timeline: Array<{
    step: string;
    completed: boolean;
    time: string;
  }>;
}
