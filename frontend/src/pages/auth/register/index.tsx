import { useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Home, Loader2, User } from 'lucide-react';
import { authKeys, dashboardKeys, publicKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useRegisterMutation } from '@/services/auth/queries';
import { StorageTypes } from '@/services/auth/keys';
import { toRequestMessage } from '@/lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name too short'),
  lastName: z.string().min(2, 'Last name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'),
  password: z.string().min(8, 'Minimum 8 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = (params.get('role') === 'LANDLORD' ? 'LANDLORD' : 'TENANT') as 'LANDLORD' | 'TENANT';
  const [role, setRole] = useState<'LANDLORD' | 'TENANT'>(defaultRole);
  const registerMutation = useRegisterMutation();
  const { setSession } = useAuthManager();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormValues>({
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
        setSession(response.data, StorageTypes.session);
        navigate(
          response.data.user.role === 'LANDLORD'
            ? dashboardKeys.landlord.home.path
            : dashboardKeys.tenant.home.path
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to={publicKeys.home.path} className="mb-6 inline-flex items-center gap-2 font-display text-2xl font-bold">
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
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  role === nextRole ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${role === nextRole ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${role === nextRole ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('role')} type="hidden" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">First name</label>
                <input
                  {...register('firstName')}
                  placeholder="John"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {errors.firstName ? <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Last name</label>
                <input
                  {...register('lastName')}
                  placeholder="Doe"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {errors.lastName ? <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p> : null}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone number</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="08012345678"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p> : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password.message}</p> : null}
            </div>

            {registerMutation.error ? (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {toRequestMessage(registerMutation.error)}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our <a href="#" className="underline">Terms of Service</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to={authKeys.login.path} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
