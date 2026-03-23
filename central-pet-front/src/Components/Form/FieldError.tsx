import React from 'react';

interface FieldErrorProps {
  message?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <span className="mt-2 block text-sm text-rose-600">{message}</span>;
};

export default FieldError;
