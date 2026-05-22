import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { type OtpInputProps, otpSlotVariants } from './variants';

const OtpInput = ({
  maxLength = 6,
  size = 'default',
  className,
  groupClassName,
  slotClassName,
  ...props
}: OtpInputProps) => {
  const { render, ...rest } = props;

  return (
    <InputOTP maxLength={maxLength} className={cn(className)} {...rest}>
      <InputOTPGroup className={cn(otpSlotVariants({ size }), groupClassName)}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <InputOTPSlot
            key={`otp-slot-${index}`}
            index={index}
            className={slotClassName}
            aria-invalid={props['aria-invalid']}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
};

export { OtpInput };
