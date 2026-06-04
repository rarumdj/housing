import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { useLandlordOnboardingQuery } from '@/services/landlord/queries';

export const LandlordOnboardingGuard = ({ children }: PropsWithChildren) => {
  const { data, isLoading, isError } = useLandlordOnboardingQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // On error, let the route render rather than trapping the user.
  if (!isError && data?.data?.onboardingStatus !== 'COMPLETED') {
    return <Navigate to={dashboardKeys.landlord.onboarding.path} replace />;
  }

  return <>{children}</>;
};
