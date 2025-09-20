import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground hover:bg-muted/80",
        selected: "bg-primary text-primary-foreground hover:bg-primary/90",
        filter: "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground border border-transparent hover:border-secondary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  selected?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, selected, ...props }, ref) => {
    return (
      <div
        className={cn(
          chipVariants({ 
            variant: selected ? "selected" : variant,
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };