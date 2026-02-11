import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginRegisterPage from './pages/LoginRegisterPage';
import ApplicantDetailsPage from './pages/ApplicantDetailsPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AppLayout from './components/AppLayout';
import { useApplicationStatus } from './hooks/useApplicationStatus';
import { Loader2 } from 'lucide-react';

// Root route component
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Protected routes wrapper
function ProtectedLayout() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    window.location.href = '/';
    return null;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});

// Step guard wrapper
function StepGuard({ children, requiredStep }: { children: React.ReactNode; requiredStep: 'details' | 'upload' | 'confirmation' }) {
  const { applicationStatus, isLoading } = useApplicationStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasDetails = !!applicationStatus?.applicantDetails;
  const hasDocuments = applicationStatus?.documents && applicationStatus.documents.length > 0;

  // Redirect logic based on current step requirements
  if (requiredStep === 'upload' && !hasDetails) {
    window.location.href = '/details';
    return null;
  }

  if (requiredStep === 'confirmation' && (!hasDetails || !hasDocuments)) {
    if (!hasDetails) {
      window.location.href = '/details';
    } else {
      window.location.href = '/upload';
    }
    return null;
  }

  return <>{children}</>;
}

// Details page wrapper component
function DetailsPageWrapper() {
  return (
    <StepGuard requiredStep="details">
      <ApplicantDetailsPage />
    </StepGuard>
  );
}

// Upload page wrapper component
function UploadPageWrapper() {
  return (
    <StepGuard requiredStep="upload">
      <DocumentUploadPage />
    </StepGuard>
  );
}

// Confirmation page wrapper component
function ConfirmationPageWrapper() {
  return (
    <StepGuard requiredStep="confirmation">
      <ConfirmationPage />
    </StepGuard>
  );
}

// Applicant details route
const detailsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/details',
  component: DetailsPageWrapper,
});

// Document upload route
const uploadRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/upload',
  component: UploadPageWrapper,
});

// Confirmation route
const confirmationRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/confirmation',
  component: ConfirmationPageWrapper,
});

// Index route component - shows login for unauthenticated, redirects to details for authenticated
function IndexComponent() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to details page
  if (identity) {
    window.location.href = '/details';
    return null;
  }

  // If not authenticated, show login page at root
  return <LoginRegisterPage />;
}

// Index route - shows login or redirects to details
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  protectedRoute.addChildren([detailsRoute, uploadRoute, confirmationRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
