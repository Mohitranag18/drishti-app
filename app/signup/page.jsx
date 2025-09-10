'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SignupForm from '../components/SignupForm';
import Link from 'next/link';

const SignupPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSignupSuccess = (user) => {
    setSignupSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
            Account Created Successfully!
          </h2>
          <p className="text-green-700 text-center">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <SignupForm onSuccess={handleSignupSuccess} />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
