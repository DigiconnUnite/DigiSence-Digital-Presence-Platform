import { useState, useCallback, useMemo } from 'react';

// Validation rules type
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  dependsOn?: {
    field: string;
    rule: (value1: string, value2: string) => string | null;
  };
}

// Form field validation state
export interface FieldValidationState {
  value: string;
  error: string | null;
  touched: boolean;
  validating: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string | null>;
  isSubmitting: boolean;
}

// Default validation rules for common fields
export const defaultValidationRules: Record<string, ValidationRule> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-',.]+$/,
    custom: (value) => {
      if (value.trim().length < 2) {
        return 'Name must be at least 2 characters long';
      }
      return null;
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (!value.includes('@')) {
        return 'Please enter a valid email address';
      }
      const [local, domain] = value.split('@');
      if (local.length === 0 || domain.length === 0) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },
  phone: {
    required: false,
    pattern: /^[\d\s+\-()]{10,15}$/,
    custom: (value) => {
      if (value && value.replace(/\D/g, '').length < 10) {
        return 'Please enter a valid phone number (at least 10 digits)';
      }
      return null;
    },
  },
  website: {
    required: false,
    pattern: /^https?:\/\/[^\s]+$/,
    custom: (value) => {
      if (value && !value.startsWith('http')) {
        return 'Website must start with http:// or https://';
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[!@#$%^&*]/.test(value)) {
        return 'Password must contain at least one special character (!@#$%^&*)';
      }
      return null;
    },
  },
  category: {
    required: true,
    custom: (value) => {
      if (!value || value === '') {
        return 'Please select a category';
      }
      return null;
    },
  },
  description: {
    required: false,
    maxLength: 1000,
    custom: (value) => {
      if (value && value.length > 1000) {
        return 'Description must be less than 1000 characters';
      }
      return null;
    },
  },
  address: {
    required: false,
    maxLength: 500,
    custom: (value) => {
      if (value && value.length > 500) {
        return 'Address must be less than 500 characters';
      }
      return null;
    },
  },
};

// Validate a single field
export const validateField = (
  value: string,
  fieldName: string,
  rules: Record<string, ValidationRule>,
  allValues?: Record<string, string>
): string | null => {
  const fieldRules = rules[fieldName];
  if (!fieldRules) return null;

  // Required check
  if (fieldRules.required && !value.trim()) {
    return `${formatFieldName(fieldName)} is required`;
  }

  // Skip further validation if empty and not required
  if (!value.trim() && !fieldRules.required) {
    return null;
  }

  // Min length check
  if (fieldRules.minLength && value.length < fieldRules.minLength) {
    return `${formatFieldName(fieldName)} must be at least ${fieldRules.minLength} characters`;
  }

  // Max length check
  if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
    return `${formatFieldName(fieldName)} must be less than ${fieldRules.maxLength} characters`;
  }

  // Pattern check
  if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
    return `Please enter a valid ${formatFieldName(fieldName).toLowerCase()}`;
  }

  // Custom validation
  if (fieldRules.custom) {
    const error = fieldRules.custom(value);
    if (error) return error;
  }

  // Dependency check
  if (fieldRules.dependsOn && allValues) {
    const dependentValue = allValues[fieldRules.dependsOn.field];
    const error = fieldRules.dependsOn.rule(value, dependentValue);
    if (error) return error;
  }

  return null;
};

// Format field name for error messages
const formatFieldName = (fieldName: string): string => {
  const nameMap: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    password: 'Password',
    category: 'Category',
    description: 'Description',
    address: 'Address',
    adminName: 'Admin Name',
    adminEmail: 'Admin Email',
  };
  return nameMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

// Custom hook for form validation
export const useFormValidation = (
  initialValues: Record<string, string>,
  validationRules: Record<string, ValidationRule>,
  validateOnChange: boolean = true
) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate all fields
  const validateAll = useCallback((currentValues?: Record<string, string>): Record<string, string | null> => {
    const vals = currentValues || values;
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(vals[fieldName] || '', fieldName, validationRules, vals);
      newErrors[fieldName] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return newErrors;
  }, [values, validationRules]);

  // Validate a single field
  const validateFieldValue = useCallback((fieldName: string, value: string): string | null => {
    const error = validateField(value, fieldName, validationRules, values);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  }, [values, validationRules]);

  // Handle field change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (validateOnChange && touched[name]) {
      validateFieldValue(name, value);
    }
  }, [validateOnChange, touched, validateFieldValue]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateFieldValue(name, value);
  }, [validateFieldValue]);

  // Handle select change
  const handleSelectChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (validateOnChange && touched[name]) {
      validateFieldValue(name, value);
    }
  }, [validateOnChange, touched, validateFieldValue]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set error for a field
  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Set touched for a field
  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setTouched((prev) => ({ ...prev, [name]: touched }));
  }, []);

  // Submit form
  const submitForm = useCallback(async <T>(
    onSubmit: (values: Record<string, string>) => Promise<T>
  ): Promise<T | null> => {
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateAll();
    const hasErrors = Object.values(validationErrors).some((error) => error !== null);

    if (hasErrors) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationRules, validateAll]);

  // Check if form is valid
  const checkIsValid = useMemo(() => {
    return Object.keys(validationRules).every((fieldName) => {
      const error = validateField(values[fieldName] || '', fieldName, validationRules, values);
      return error === null;
    });
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: checkIsValid,
    handleChange,
    handleBlur,
    handleSelectChange,
    validateField: validateFieldValue,
    validateAll,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    submitForm,
  };
};

// Helper function to check if field has error
export const hasError = (errors: Record<string, string | null>, touched: Record<string, boolean>, fieldName: string): boolean => {
  return touched[fieldName] && errors[fieldName] !== null && errors[fieldName] !== undefined;
};

// Helper function to check if field is valid
export const isFieldValid = (errors: Record<string, string | null>, touched: Record<string, boolean>, fieldName: string): boolean => {
  return touched[fieldName] && (errors[fieldName] === null || errors[fieldName] === undefined);
};

// Helper function to check if field is validating
export const isFieldValidating = (validating: Record<string, boolean>, fieldName: string): boolean => {
  return validating[fieldName] || false;
};

// Password strength calculator
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  if (/[^A-Za-z0-9!@#$%^&*]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-lime-500' },
    { label: 'Strong', color: 'bg-green-500' },
    { label: 'Very Strong', color: 'bg-emerald-500' },
    { label: 'Excellent', color: 'bg-teal-500' },
  ];

  const index = Math.min(Math.floor(score / 1.5), levels.length - 1);
  return {
    score,
    label: levels[index].label,
    color: levels[index].color,
  };
};
