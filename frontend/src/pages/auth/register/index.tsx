import { useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Home, User } from 'lucide-react';
import { authKeys, publicKeys } from '@/routes/keys';
import { useRegisterMutation } from '@/services/auth/queries';
import { toRequestMessage } from '@/lib/utils';
import { CustomButton } from '@/components/button';
import { FormInput } from '@/components/forms/form-input';
import { FormPasswordInput } from '@/components/forms/form-password-input';
import FormPhoneInput from '@/components/forms/form-phone-input';
import { Field, FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name too short'),
  lastName: z.string().min(2, 'Last name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'),
  password: z.string().min(8, 'Minimum 8 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = (params.get('role') === 'LANDLORD' ? 'LANDLORD' : 'TENANT') as 'LANDLORD' | 'TENANT';
  const [role, setRole] = useState<'LANDLORD' | 'TENANT'>(defaultRole);
  const registerMutation = useRegisterMutation();
  const { control, handleSubmit, setValue, register } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const selectRole = (nextRole: 'LANDLORD' | 'TENANT') => {
    setRole(nextRole);
    setValue('role', nextRole);
  };

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: (response) => {
        navigate(authKeys.emailVerify.build(response.data.intentCode), {
          state: { email: response.data.email },
        });
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to={publicKeys.home.path}
            className="mb-6 inline-flex items-center gap-2 font-display text-2xl font-bold"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            HouseHunt
          </Link>
          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Join the future of renting in Nigeria</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          <div className="mb-6 grid grid-cols-2 gap-3">
            {([
              ['TENANT', 'Find a home', User],
              ['LANDLORD', 'List property', Building2],
            ] as const).map(([nextRole, label, Icon]) => (
              <button
                key={nextRole}
                type="button"
                onClick={() => selectRole(nextRole)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                  role === nextRole ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}
              >
                <Icon
                  className={cn('h-5 w-5', role === nextRole ? 'text-primary' : 'text-muted-foreground')}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    role === nextRole ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          <form id="form-register" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('role')} />
            <FieldGroup className="gap-5">
              <div className="grid grid-cols-2 gap-3">
                <FormInput control={control} name="firstName" label="First name" placeholder="John" />
                <FormInput control={control} name="lastName" label="Last name" placeholder="Doe" />
              </div>

              <FormInput
                control={control}
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
              />

              <FormPhoneInput
                control={control}
                name="phone"
                label="Phone number"
                placeholder="08012345678"
                defaultCountry="NG"
              />

              <FormPasswordInput
                control={control}
                name="password"
                label="Password"
                placeholder="Minimum 8 characters"
              />

              {registerMutation.error ? (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {toRequestMessage(registerMutation.error)}
                </div>
              ) : null}

              <Field orientation="horizontal" className="grid">
                <CustomButton
                  type="submit"
                  form="form-register"
                  variant="primary"
                  className="w-full"
                  loading={registerMutation.isPending}
                  disabled={registerMutation.isPending}
                >
                  Create account
                </CustomButton>

                <p className="text-center text-xs text-muted-foreground">
                  By signing up you agree to our <a href="#" className="underline">Terms of Service</a> and{' '}
                  <a href="#" className="underline">Privacy Policy</a>
                </p>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to={authKeys.login.path}
                    className="text-nowrap text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
