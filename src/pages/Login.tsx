
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, User, Stethoscope, Shield, Pill } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.mustChangePassword) {
        navigate('/change-password', { state: { userId: user.id } });
        return;
      }
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'patient':
          navigate('/patient-dashboard');
          break;
        case 'receptionist':
          navigate('/receptionist-dashboard');
          break;
        case 'pharmacist':
          navigate('/pharmacy-dashboard');
          break;
        case 'super-admin':
          navigate('/superadmin');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // No redirect here; handled by useEffect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="medical-gradient p-3 rounded-lg mr-3">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MedSync</h1>
            <p className="text-sm text-gray-500">Smart Healthcare Login</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your healthcare dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full medical-gradient text-white" disabled={loading}>
                {loading ? 'Logging In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
            <Link to="/" className="text-sm text-primary hover:underline">
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
