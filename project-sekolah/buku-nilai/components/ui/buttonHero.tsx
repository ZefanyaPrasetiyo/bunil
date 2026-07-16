import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
}) => {
  const baseClasses =
    "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    outline:
      "bg-transparent text-foreground border border-border hover:bg-card",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;