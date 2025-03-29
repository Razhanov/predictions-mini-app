import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={`inline-flex items-center justify-between rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm shadow-sm transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = SelectPrimitive.Value;

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={`z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm ${className}`}
            {...props}
        >
            <SelectPrimitive.Viewport className="p-1">
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={`relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-blue-50 focus:text-blue-600 ${className}`}
        {...props}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute right-2 flex h-4 w-4 items-center justify-center text-blue-600">
            <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";