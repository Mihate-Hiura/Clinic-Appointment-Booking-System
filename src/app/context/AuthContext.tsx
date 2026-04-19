import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'customer' | 'receptionist' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  citizenId: string;
  approved: boolean;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  appointments: Appointment[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, phone: string, citizenId: string) => Promise<boolean>;
  logout: () => void;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'customerId' | 'customerName' | 'customerEmail' | 'status' | 'createdAt' | 'doctorId' | 'doctorName'> & { doctorId?: string; doctorName?: string }) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: 'approved' | 'rejected') => Promise<void>;
  updateUserApproval: (userId: string, approved: boolean) => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject('Invalid token'))
      .then(data => setCurrentUser(data.user))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
    } else {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshUsers();
      refreshAppointments();
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, phone: string, citizenId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, phone, citizenId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user.approved) {
          setToken(data.token);
          setCurrentUser(data.user);
        }
        refreshUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'customerId' | 'customerName' | 'customerEmail' | 'status' | 'createdAt' | 'doctorId' | 'doctorName'> & { doctorId?: string; doctorName?: string }): Promise<void> => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(appointment)
      });
      if (res.ok) {
        await refreshAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await refreshAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserApproval = async (userId: string, approved: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/users/${userId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });
      if (res.ok) {
        await refreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        appointments,
        login,
        signup,
        logout,
        createAppointment,
        updateAppointmentStatus,
        updateUserApproval,
        refreshUsers,
        refreshAppointments,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
