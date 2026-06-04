import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home, Loader2, Mail } from 'lucide-react';
import { authKeys, getPostLoginPath, publicKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useConfirmEmailMutation, useEmailIntentMutation } from '@/services/auth/queries';
import { StorageTypes } from '@/services/auth/keys';
import { toRequestMessage } from '@/lib/utils';

const OTP_LENGTH = 6;

const EmailVerifyPage = () => {
  const navigate = useNavigate();
  const { code = '' } = useParams<{ code: string }>();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const { setSession } = useAuthManager();
  const confirmMutation = useConfirmEmailMutation();
  const intentMutation = useEmailIntentMutation();

  const [intentCode, setIntentCode] = useState(code);
  // Pre-filled while email delivery isn't integrated; the OTP is currently 000000.
  const [otp, setOtp] = useState('000000');
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    confirmMutation.mutate(
      { intentCode, otp },
      {
        onSuccess: (response) => {
          setSession(response.data, StorageTypes.session);
          navigate(getPostLoginPath(response.data.user.role));
        },
        onError: (err) => setError(toRequestMessage(err)),
      },
    );
  };

  const handleResend = () => {
    if (!email) return;
    setError('');
    setResent(false);
    intentMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          if (response.data.intentCode) {
            setIntentCode(response.data.intentCode);
            navigate(authKeys.emailVerify.build(response.data.intentCode), {
              replace: true,
              state: { email },
            });
          }
          setResent(true);
        },
      },
    );
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
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-center font-display text-2xl font-bold">Verify your email</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter the verification code
            {email ? (
              <>
                {' '}sent to <span className="font-medium text-foreground">{email}</span>
              </>
            ) : null}
            .
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
              className="w-full rounded-xl border border-input bg-background py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="000000"
            />

            {error ? (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            ) : null}

            {resent ? (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                A new code has been sent.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={confirmMutation.isPending || otp.length < OTP_LENGTH || !intentCode}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {confirmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify email
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            {email ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={intentMutation.isPending}
                className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
              >
                {intentMutation.isPending ? 'Sending…' : 'Resend code'}
              </button>
            ) : (
              <span />
            )}
            <Link to={authKeys.login.path} className="text-muted-foreground hover:text-foreground">
              Back to sign in
            </Link>
          </div>

          {import.meta.env.DEV ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
              Dev: email delivery isn't integrated yet — the verification code is{' '}
              <span className="font-mono text-foreground">000000</span>.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EmailVerifyPage;
