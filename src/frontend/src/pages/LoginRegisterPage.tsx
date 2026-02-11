import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FileText, Shield, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function LoginRegisterPage() {
  const { login, loginStatus, identity, isLoggingIn, isLoginError, loginError } = useInternetIdentity();

  useEffect(() => {
    if (identity) {
      window.location.href = '/details';
    }
  }, [identity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Application Portal</h1>
          <p className="text-lg text-muted-foreground">Secure document submission system</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Authentication
              </CardTitle>
              <CardDescription>
                Login securely using Internet Identity - no passwords required
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Easy Submission
              </CardTitle>
              <CardDescription>
                Submit your application and documents in a few simple steps
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Sign in to begin your application process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginError?.message || 'Login failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Step 1: Personal Details</p>
                  <p className="text-muted-foreground">Fill in your applicant information</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Step 2: Upload Documents</p>
                  <p className="text-muted-foreground">Submit required documentation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Step 3: Confirmation</p>
                  <p className="text-muted-foreground">Receive submission confirmation</p>
                </div>
              </div>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full text-lg h-12"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our secure authentication process.
              Your data is encrypted and protected.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
