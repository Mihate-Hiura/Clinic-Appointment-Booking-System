import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DoctorDashboard() {
  const { currentUser, appointments, logout } = useAuth();
  const navigate = useNavigate();

  const myAppointments = appointments.filter(
    (apt) => apt.doctorId === currentUser?.id && apt.status === "approved",
  );

  const upcomingAppointments = myAppointments.filter(
    (apt) => new Date(apt.date) >= new Date(),
  );

  const pastAppointments = myAppointments.filter(
    (apt) => new Date(apt.date) < new Date(),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">HealthCare Clinic</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-neutral-600">Doctor</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">My Schedule</h1>
          <p className="text-neutral-600">View your approved appointments</p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-6">Upcoming Appointments</h2>

            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-lg border border-neutral-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {apt.customerName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {apt.customerEmail}
                        </p>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
                        Approved
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Chief Complaint:</span>{" "}
                        {apt.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">Past Appointments</h2>

            <div className="space-y-4">
              {pastAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No past appointments</p>
                </div>
              ) : (
                pastAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-lg border border-neutral-200 p-6 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {apt.customerName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {apt.customerEmail}
                        </p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Chief Complaint:</span>{" "}
                        {apt.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
