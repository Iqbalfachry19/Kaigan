import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
