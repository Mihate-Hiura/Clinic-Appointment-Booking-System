import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Activity } from 'lucide-react';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (await signup(email, password, name, role)) {
      if (role === 'customer' || role === 'admin') {
        navigate('/dashboard');
      } else {
        setSuccess('Account created! Waiting for admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      setError('Email already exists');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-semibold">HealthCare Clinic</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Create account</h1>
          <p className="text-neutral-600">Join our clinic system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
            {(role === 'receptionist' || role === 'doctor') && (
              <p className="text-xs text-neutral-600">
                Your account will require admin approval before you can log in.
              </p>
            )}
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
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
