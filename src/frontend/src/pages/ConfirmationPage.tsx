import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Mail, MessageCircle, LogOut, FileText } from 'lucide-react';

export default function ConfirmationPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submission Complete</h2>
          <p className="text-muted-foreground">Step 3 of 3 - Confirmation</p>
        </div>
      </div>

      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
          <CardDescription className="text-base">
            Your application and documents have been received
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-background rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">What happens next?</h3>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Email Notification Sent</p>
                <p className="text-sm text-muted-foreground">
                  Your documents have been sent to the admin team via email for review.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">WhatsApp Notification Sent</p>
                <p className="text-sm text-muted-foreground">
                  A confirmation has also been sent to the admin team via WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Under Review</p>
                <p className="text-sm text-muted-foreground">
                  The admin team will review your application and contact you with updates.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              Please keep your contact information up to date. You will be notified once your
              application has been processed.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleLogout} variant="outline" size="lg" className="flex-1 gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you have any questions about your application or need to make changes, please
            contact our support team. Your application reference will be provided via email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
