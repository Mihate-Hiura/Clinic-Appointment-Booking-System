import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, LogOut, CheckCircle, XCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { currentUser, users, updateUserApproval, logout } = useAuth();
  const navigate = useNavigate();

  const pendingUsers = users.filter(
    u => !u.approved && (u.role === 'receptionist' || u.role === 'doctor')
  );

  const approvedStaff = users.filter(
    u => u.approved && (u.role === 'receptionist' || u.role === 'doctor')
  );

  const handleApprove = async (userId: string) => {
    await updateUserApproval(userId, true);
  };

  const handleReject = async (userId: string) => {
    await updateUserApproval(userId, false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      doctor: 'bg-blue-100 text-blue-800',
      receptionist: 'bg-purple-100 text-purple-800',
      customer: 'bg-green-100 text-green-800',
      admin: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">HealthCare Clinic Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-neutral-600">Administrator</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Account Management</h1>
          <p className="text-neutral-600">Review and approve staff accounts</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Pending Approvals</h2>
              <Badge variant="secondary">{pendingUsers.length} pending</Badge>
            </div>

            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No pending account approvals</p>
                </div>
              ) : (
                pendingUsers.map(user => (
                  <div key={user.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
                        {getRoleBadge(user.role)}
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => handleApprove(user.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Account
                      </Button>
                      <Button
                        onClick={() => handleReject(user.id)}
                        variant="destructive"
                        className="flex-1"
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
            <h2 className="text-xl font-semibold mb-6">Approved Staff</h2>

            <div className="space-y-4">
              {approvedStaff.length === 0 ? (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
                  <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No approved staff members</p>
                </div>
              ) : (
                approvedStaff.map(user => (
                  <div key={user.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
                        {getRoleBadge(user.role)}
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">All Users</h2>

            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.approved ? (
                          <Badge variant="default">Approved</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
