import * as React from "react";
// NOTE: This import path is correct relative to src/lib/utils.ts
import { cn } from "../../lib/utils"; 

// Simple placeholder for the Button component based on shadcn/ui convention
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // NOTE: In a real project, this function would use a library like 'cva' to map variant to Tailwind classes.
    // For now, we will use simple defaults for the destructuve variant used in AppShell.
    
    let baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    let variantStyles = "text-white bg-blue-600 hover:bg-blue-700"; // Default

    if (variant === "destructive") {
        variantStyles = "text-white bg-red-500 hover:bg-red-600";
    }

    if (size === "default") {
        baseStyles += " h-10 py-2 px-4 text-sm";
    }

    return (
      <button
        className={cn(baseStyles, variantStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };