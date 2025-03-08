import * as React from "react";
import { cn } from "@/utils/cn";

const Dialog = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (state: boolean) => {
    setIsOpen(state);
    if (onOpenChange) {
      onOpenChange(state);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => handleOpenChange(false)} 
          />
          <div className="z-50 grid w-full max-w-lg gap-4 bg-white p-6 shadow-lg rounded-lg">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  onOpenChange: handleOpenChange
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </>
  );
};

const DialogTrigger = ({
  children,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const Trigger = asChild ? (child: React.ReactElement) => React.cloneElement(child, props) : 'div';
  
  return (
    <div {...props} style={{ cursor: 'pointer' }}>
      {asChild ? 
        React.Children.map(children, child => 
          React.isValidElement(child) ? 
            React.cloneElement(child as React.ReactElement) : 
            child
        ) : 
        children
      }
    </div>
  );
};

const DialogContent = ({ 
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
};

const DialogTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
