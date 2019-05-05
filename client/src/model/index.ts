export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
  prefferedWorkingHourPerDay: number;
}

export interface WorkEntry {
  id: number;
  date: string;
  hours: number;
  notes?: string;
}
