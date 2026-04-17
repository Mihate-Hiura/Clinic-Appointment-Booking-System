import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CustomerDashboard() {
  const { currentUser, appointments, users, createAppointment, logout } = useAuth();
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');

  const doctors = users.filter(u => u.role === 'doctor' && u.approved);
  const myAppointments = appointments.filter(apt => apt.customerId === currentUser?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    await createAppointment({
      doctorId,
      doctorName: doctor.name,
      date,
      time,
      reason,
    });

    setSuccess('Appointment booked successfully!');
    setDoctorId('');
    setDate('');
    setTime('');
    setReason('');

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">HealthCare Clinic</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-neutral-600">Customer</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-8">My Appointments</h1>

        <Tabs defaultValue="book" className="space-y-8">
          <TabsList>
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <div className="max-w-2xl bg-white rounded-lg border border-neutral-200 p-8">
              <h2 className="text-xl font-semibold mb-6">Schedule New Appointment</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select value={doctorId} onValueChange={setDoctorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for appointment"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Book Appointment
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {myAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No appointments yet</p>
                </div>
              ) : (
                myAppointments.map(apt => (
                  <div key={apt.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{apt.doctorName}</h3>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Reason:</span> {apt.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
