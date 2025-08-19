
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
  onSwitchToReset: () => void;
  loading: boolean;
}

interface FormData {
  email: string;
  password: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  onSwitchToSignUp,
  onSwitchToReset,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.email, data.password);
  };

  return (
    <>
      <div className="auth-form-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your CodeXI account</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="auth-form">
        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <Input
              type="email"
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="auth-input"
            />
          </div>
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="auth-button auth-button-primary"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <button
          type="button"
          onClick={onSwitchToReset}
          className="auth-link"
        >
          Forgot your password?
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignUp} className="auth-link-primary">
            Sign up here
          </button>
        </p>
      </form>
    </>
  );
};
