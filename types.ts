export enum Status {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Pending = 'Pendente',
  Accepted = 'Aceita',
  Error = 'Erro',
  Warning = 'Alerta',
  Completed = 'Concluído',
  InTransit = 'Em Trânsito',
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: Status;
  eta: string;
  progress: number;
  driverId?: string;
  vehicleId?: string;
  trailerId?: string;
  trailer?: string;
  startTime?: string;
  tempFront?: number;
  tempRear?: number;
  jobDescription?: string;
  cargo?: {
    type: string;
    weight: string;
    value: string;
  };
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: Status;
  location: string;
  fuel: number;
  driverId?: string;
  manufacturer?: string;
  year?: number;
  type?: string;
  odometer?: number;
}

export interface Driver {
  id: string;
  name: string;
  status: Status;
  rating: number;
  tripsCompleted: number;
  avatar: string;
  license_category?: string;
  license_expiry?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  license_number?: string;
}

export interface Alert {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  message: string;
  timestamp: string;
  vehicleId?: string;
  resolved_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export enum RouteName {
  Login = '/login',
  Home = '/',
  LiveMap = '/map',
  TripsList = '/trips',
  TripDetail = '/trips/:id',
  CreateTrip = '/trips/create',
  AssignTrip = '/trips/assign',
  VehiclesList = '/vehicles',
  VehicleDetail = '/vehicles/:id',
  TrailersList = '/trailers',
  DriversList = '/drivers',
  DriverDetail = '/drivers/:id',
  Alerts = '/alerts',
  Reports = '/reports',
  Geofences = '/geofences',
  Maintenance = '/maintenance',
  ChatCenter = '/chat',
  Settings = '/settings',
  AuditLogs = '/audit',
  Onboarding = '/onboarding',
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'operator';
  status?: string;
  created_at?: string;
  phone?: string;
  avatar_url?: string;
  active?: boolean;
}