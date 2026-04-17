import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Activity } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (await login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials or account pending approval');
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
          <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="text-neutral-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-12 p-4 bg-blue-50 rounded-lg text-sm text-neutral-700">
          <p className="font-medium mb-2">Demo accounts:</p>
          <ul className="space-y-1 text-xs">
            <li>Customer: customer@test.com / customer123</li>
            <li>Receptionist: receptionist@clinic.com / receptionist123</li>
            <li>Doctor: doctor@clinic.com / doctor123</li>
            <li>Admin: admin@clinic.com / admin123</li>
          </ul>
          <p className="mt-3 text-xs text-neutral-600">
            Note: Pending approval accounts exist for testing admin features
          </p>
        </div>
      </div>
    </div>
  );
}
