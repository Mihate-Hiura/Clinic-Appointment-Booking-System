import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const TIME_SLOTS = [
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30'
];

export function BookAppointmentPage() {
  const { users, appointments, createAppointment } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const doctors = users.filter(u => u.role === 'doctor' && u.approved);

  const availableDoctors = doctors.filter(doctor => {
    if (!date || !time) return true;
    return !appointments.some(apt => 
      apt.doctorId === doctor.id && 
      apt.date === date && 
      apt.time.startsWith(time) &&
      apt.status !== 'rejected'
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isAutoAssign = !doctorId || doctorId === 'null';
    const doctor = doctors.find(d => d.id === doctorId);

    try {
      await createAppointment({
        doctorId: isAutoAssign ? undefined : doctorId,
        doctorName: doctor?.name,
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
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold mb-8">Book Appointment</h1>

      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <h2 className="text-xl font-semibold mb-6">Schedule New Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor (Optional)</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Any Available Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Any Available Doctor</SelectItem>
                {availableDoctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {date && time && availableDoctors.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                No doctors available for this specific slot.
              </p>
            )}
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
              <Label htmlFor="time">Time Slot</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(slot => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

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
