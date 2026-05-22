import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home } from 'lucide-react';
import { ADMIN_DEMO, authKeys, getPostLoginPath, publicKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useLoginMutation } from '@/services/auth/queries';
import { StorageTypes } from '@/services/auth/keys';
import { toRequestMessage } from '@/lib/utils';
import { CustomButton } from '@/components/button';
import { FormInput } from '@/components/forms/form-input';
import { FormPasswordInput } from '@/components/forms/form-password-input';
import { Field, FieldGroup } from '@/components/ui/field';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const { setSession } = useAuthManager();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        setSession(response.data, StorageTypes.session);
        navigate(getPostLoginPath(response.data.user.role));
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
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          <form id="form-signin" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-5">
              <FormInput
                control={control}
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
              />

              <FormPasswordInput
                control={control}
                name="password"
                label="Password"
                placeholder="Enter your password"
              />

              {loginMutation.error ? (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {toRequestMessage(loginMutation.error)}
                </div>
              ) : null}

              <Field orientation="horizontal" className="grid">
                <CustomButton
                  type="submit"
                  form="form-signin"
                  variant="primary"
                  className="w-full"
                  loading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                >
                  Sign in
                </CustomButton>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  No account?{' '}
                  <Link
                    to={authKeys.register.path}
                    className="text-nowrap text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>

          {import.meta.env.DEV ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
              Demo admin (created by DB migrations). If you see “Invalid email or password”, run{' '}
              <code className="rounded bg-muted px-1">yarn db:migrate</code> from the repo root, then try again:{' '}
              <span className="font-mono text-foreground">{ADMIN_DEMO.email}</span> /{' '}
              <span className="font-mono text-foreground">{ADMIN_DEMO.password}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
