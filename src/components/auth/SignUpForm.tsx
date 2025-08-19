
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, fullName: string) => void;
  onSwitchToSignIn: () => void;
  loading: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  onSwitchToSignIn,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const password = watch('password');

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.email, data.password, data.fullName);
  };

  return (
    <>
      <div className="auth-form-header">
        <h2>Create Account</h2>
        <p>Join CodeXI and boost your development</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="auth-form">
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <Input
              type="text"
              placeholder="Enter your full name"
              {...register('fullName', { required: 'Full name is required' })}
              className="auth-input"
            />
          </div>
          {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
        </div>

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
              placeholder="Create a password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
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

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="auth-button auth-button-success"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToSignIn} className="auth-link-primary">
            Sign in here
          </button>
        </p>
      </form>
    </>
  );
};
