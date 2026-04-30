import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReceptionistDashboard() {
  const { currentUser, appointments, updateAppointmentStatus, logout } =
    useAuth();
  const navigate = useNavigate();

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending",
  );
  const processedAppointments = appointments.filter(
    (apt) => apt.status !== "pending",
  );

  const handleApprove = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, "approved");
  };

  const handleReject = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, "rejected");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">
          Pending
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent">
          Rejected
        </Badge>
      );
    }
    return <Badge variant="default">{status}</Badge>;
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
              <p className="text-xs text-neutral-600">Receptionist</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            Appointment Management
          </h1>
          <p className="text-neutral-600">
            Review and validate patient appointments
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-6">Pending Approvals</h2>

            <div className="space-y-4">
              {pendingAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No pending appointments</p>
                </div>
              ) : (
                pendingAppointments.map((apt) => (
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
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <User className="w-4 h-4" />
                        <span>{apt.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Reason:</span>{" "}
                        {apt.reason}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(apt.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(apt.id)}
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {processedAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No processed appointments</p>
                </div>
              ) : (
                processedAppointments.map((apt) => (
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
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <User className="w-4 h-4" />
                        <span>{apt.doctorName}</span>
                      </div>
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
                        <span className="font-medium">Reason:</span>{" "}
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
