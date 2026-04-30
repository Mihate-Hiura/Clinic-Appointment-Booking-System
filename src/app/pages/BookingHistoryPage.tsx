import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

export function BookingHistoryPage() {
  const { currentUser, appointments } = useAuth();

  const myAppointments = appointments.filter(apt => apt.customerId === currentUser?.id);

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">Pending</Badge>;
    }
    if (status === 'approved') {
      return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">Approved</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent">Rejected</Badge>;
    }
    return <Badge variant="default">{status}</Badge>;
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Booking History</h1>

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
    </div>
  );
}
