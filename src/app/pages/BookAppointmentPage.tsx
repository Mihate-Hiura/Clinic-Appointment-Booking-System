import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function BookAppointmentPage() {
  const { users, createAppointment } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');

  const doctors = users.filter(u => u.role === 'doctor' && u.approved);

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold mb-8">Book Appointment</h1>

      <div className="bg-white rounded-lg border border-neutral-200 p-8">
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
    </div>
  );
}
