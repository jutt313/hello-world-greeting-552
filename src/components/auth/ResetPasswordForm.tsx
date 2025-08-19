
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onSubmit: (email: string) => void;
  onBackToSignIn: () => void;
  loading: boolean;
}

interface FormData {
  email: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  onBackToSignIn,
  loading,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.email);
  };

  return (
    <>
      <div className="auth-form-header">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="auth-form">
        <div className="form-group">
          <label>Email Address</label>
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

        <Button
          type="submit"
          disabled={loading}
          className="auth-button auth-button-warning"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <button
          type="button"
          onClick={onBackToSignIn}
          className="auth-back-button"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>
      </form>
    </>
  );
};
