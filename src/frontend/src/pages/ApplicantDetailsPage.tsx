import { useState } from 'react';
import { useSubmitApplicantDetails } from '../hooks/useSubmitApplicantDetails';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, AlertCircle, User, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

export default function ApplicantDetailsPage() {
  const { userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const submitDetails = useSubmitApplicantDetails();

  const [profileName, setProfileName] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: '',
    fatherName: '',
    address: '',
    serviceOpted: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Show profile setup modal when needed
  const needsProfile = !profileLoading && isFetched && userProfile === null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      return;
    }
    await saveProfile.mutateAsync({ name: profileName.trim(), email: undefined });
    setShowProfileSetup(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Applicant name is required';
    }
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.serviceOpted) {
      newErrors.serviceOpted = 'Please select a service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await submitDetails.mutateAsync({
      applicantName: formData.applicantName.trim(),
      fatherName: formData.fatherName.trim(),
      address: formData.address.trim(),
      serviceOpted: formData.serviceOpted,
      status: 'submitted',
      hasDocuments: false,
    });

    window.location.href = '/upload';
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={needsProfile || showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
            <DialogDescription>
              Please enter your name to continue with your application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Your Name</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
            <p className="text-muted-foreground">Step 1 of 3 - Personal Information</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Information
            </CardTitle>
            <CardDescription>
              Please fill in all required fields accurately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitDetails.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submitDetails.error instanceof Error
                      ? submitDetails.error.message
                      : 'Failed to submit application. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="applicantName">
                  Applicant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  placeholder="Enter your full name"
                  className={errors.applicantName ? 'border-destructive' : ''}
                />
                {errors.applicantName && (
                  <p className="text-sm text-destructive">{errors.applicantName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">
                  Father's Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="Enter father's full name"
                  className={errors.fatherName ? 'border-destructive' : ''}
                />
                {errors.fatherName && (
                  <p className="text-sm text-destructive">{errors.fatherName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your complete address"
                  rows={4}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceOpted">
                  Service Opted For <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.serviceOpted}
                  onValueChange={(value) => setFormData({ ...formData, serviceOpted: value })}
                >
                  <SelectTrigger className={errors.serviceOpted ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport Services</SelectItem>
                    <SelectItem value="visa">Visa Application</SelectItem>
                    <SelectItem value="license">License Renewal</SelectItem>
                    <SelectItem value="certificate">Certificate Verification</SelectItem>
                    <SelectItem value="registration">Business Registration</SelectItem>
                    <SelectItem value="other">Other Services</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceOpted && (
                  <p className="text-sm text-destructive">{errors.serviceOpted}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  disabled={submitDetails.isPending}
                >
                  {submitDetails.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Continue to Document Upload'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
