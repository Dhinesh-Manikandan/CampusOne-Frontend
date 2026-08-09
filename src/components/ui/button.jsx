import * as React from "react";
import "./button.css";

export const Button = React.forwardRef(({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-size-${size}`;
  
  return (
    <button
      ref={ref}
      className={`ui-button ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";
