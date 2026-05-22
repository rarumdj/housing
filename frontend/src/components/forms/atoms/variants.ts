import type { InputOTP } from "@/components/ui/input-otp";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type Cleave from "cleave.js/react";

const inputVariants = cva("w-full", {
  variants: {
    size: {
      default: "h-10",
      sm: "h-8",
      lg: "h-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>;

type TextareaProps = React.ComponentProps<"textarea">;

interface ComboboxOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: string;
}

interface ComboboxProps {
  name?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (option: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  popoverClassName?: string;
  loading?: boolean;
  maxHeight?: string;
}

type CleaveProps = Partial<Omit<React.ComponentProps<typeof Cleave>, "size">> &
  VariantProps<typeof inputVariants>;

const otpSlotVariants = cva(
  "gap-2.5 justify-between w-full *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border",
  {
    variants: {
      size: {
        default: "*:data-[slot=input-otp-slot]:size-10",
        sm: "*:data-[slot=input-otp-slot]:size-8",
        lg: "*:data-[slot=input-otp-slot]:size-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type OtpInputProps = Omit<React.ComponentProps<typeof InputOTP>, "size"> & {
  maxLength?: number;
  size?: VariantProps<typeof otpSlotVariants>["size"];
  groupClassName?: string;
  slotClassName?: string;
};

export {
  inputVariants,
  type InputProps,
  type TextareaProps,
  type ComboboxProps,
  type ComboboxOption,
  type CleaveProps,
  type OtpInputProps,
  otpSlotVariants,
};
