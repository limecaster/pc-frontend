import * as React from "react";
import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { 
    onCheckedChange?: (checked: boolean) => void 
  }
>(({ className, onCheckedChange, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
    
    // Call the original onChange if it exists
    if (props.onChange) {
      props.onChange(event);
    }
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      <Check className="absolute h-3 w-3 top-0.5 left-0.5 text-primary opacity-0 peer-checked:opacity-100" />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
