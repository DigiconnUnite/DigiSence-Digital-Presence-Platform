import React from 'react';
import { UseFormRegister, FieldErrors, FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  showPasswordToggle?: boolean;
  helperText?: string;
  rows?: number;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className,
  icon,
  children,
  showPasswordToggle = false,
  helperText,
  rows,
  register,
  errors,
}: FormFieldProps) => {
  const error = errors[name]?.message as string | undefined;
  const showPassword = type === 'password';

  // Get register result
  const { onChange, onBlur, ref } = register(name);

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={name} className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors',
            error ? 'text-red-500' : 'text-gray-400'
          )}>
            {error ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              icon
            )}
          </div>
        )}
        
        <div className={cn('relative', icon && 'pl-10', showPasswordToggle && 'pr-10')}>
          {type === 'textarea' ? (
            <textarea
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-white transition-all duration-200',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200',
                disabled && 'bg-gray-50 cursor-not-allowed'
              )}
              rows={rows || 3}
              onChange={onChange}
              onBlur={onBlur}
              ref={ref}
            />
          ) : type === 'select' ? (
            <select
              id={name}
              disabled={disabled}
              required={required}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-white transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200',
                disabled && 'bg-gray-50 cursor-not-allowed'
              )}
              onChange={onChange}
              onBlur={onBlur}
              ref={ref}
            >
              {children}
            </select>
          ) : (
            <input
              id={name}
              type={showPasswordToggle ? (showPassword ? 'text' : type) : type}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-white transition-all duration-200',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200',
                disabled && 'bg-gray-50 cursor-not-allowed'
              )}
              onChange={onChange}
              onBlur={onBlur}
              ref={ref}
            />
          )}
        </div>

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById(name) as HTMLInputElement;
              if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
              }
            }}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-md flex items-center justify-center focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-xs animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p className="text-gray-500 text-xs">{helperText}</p>
      )}
    </div>
  );
};

// Password Strength Indicator Component
interface PasswordStrengthProps {
  password: string;
  show: boolean;
}

export const PasswordStrength = ({ password, show }: PasswordStrengthProps) => {
  if (!show || !password) return null;

  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-lime-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Excellent', color: 'bg-emerald-500' },
    ];

    const index = Math.min(Math.floor(score / 1.2), levels.length - 1);
    return {
      score: Math.min(score, 6),
      label: levels[index].label,
      color: levels[index].color,
    };
  };

  const { score, label, color } = getStrength();

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Password strength:</span>
        <span className={cn('font-medium', {
          'text-red-600': score <= 1,
          'text-orange-600': score === 2,
          'text-yellow-600': score === 3,
          'text-lime-600': score === 4,
          'text-green-600': score >= 5,
        })}>
          {label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? color : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Form Progress Indicator
interface FormProgressProps {
  totalFields: number;
  completedFields: number;
}

export const FormProgress = ({ totalFields, completedFields }: FormProgressProps) => {
  const percentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Form completion</span>
        <span className="font-medium text-gray-900">{percentage}%</span>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Validation Checklist Component
interface ValidationChecklistProps {
  rules: { label: string; isValid: boolean }[];
}

export const ValidationChecklist = ({ rules }: ValidationChecklistProps) => {
  const completedCount = rules.filter((r) => r.isValid).length;

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Requirements</span>
        <span className="font-medium text-gray-900">
          {completedCount}/{rules.length} met
        </span>
      </div>
      <div className="space-y-1">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <CheckCircle2
              className={cn(
                'h-3.5 w-3.5 flex-shrink-0',
                rule.isValid ? 'text-green-500' : 'text-gray-300'
              )}
            />
            <span className={rule.isValid ? 'text-gray-900' : 'text-gray-500'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
