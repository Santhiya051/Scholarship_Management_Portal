import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-academic-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <ShieldX className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-academic-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-academic-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-academic-300 text-sm font-medium rounded-lg text-academic-700 bg-white hover:bg-academic-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;