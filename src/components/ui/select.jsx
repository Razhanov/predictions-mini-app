import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={'inline-flex items-center justify-between rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}'}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className='ml-2 h-4 w-4 text-gray-500'/>
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = SelectPrimitive.Value;

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={`z-50 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 ${className}`}
            {...props}
        >
            <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={`relative flex cursor-pointer select-none items-center rounded-lg px-4 py-2 text-sm text-gray-800 hover:bg-blue-100 focus:bg-blue-100 focus:outline-none ${className}`}
        {...props}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute right-3 flex items-center justify-center">
            <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';