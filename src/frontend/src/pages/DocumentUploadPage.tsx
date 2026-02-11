import { useState } from 'react';
import { useUploadApplicationDocuments } from '../hooks/useUploadApplicationDocuments';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Upload, File, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  blob?: ExternalBlob;
}

export default function DocumentUploadPage() {
  const uploadDocuments = useUploadApplicationDocuments();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithProgress[] = Array.from(selectedFiles).map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Convert files to ExternalBlobs with progress tracking
    const blobPromises = files.map(async (fileWithProgress, index) => {
      const arrayBuffer = await fileWithProgress.file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, progress: percentage, status: 'uploading' as const }
              : f
          )
        );
      });

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, blob } : f))
      );

      return blob;
    });

    const blobs = await Promise.all(blobPromises);

    // Mark all as uploading
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })));

    try {
      await uploadDocuments.mutateAsync(blobs);

      // Mark all as success
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'success' as const, progress: 100 })));

      // Navigate to confirmation after a brief delay
      setTimeout(() => {
        window.location.href = '/confirmation';
      }, 1000);
    } catch (error) {
      // Mark all as error
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'error' as const })));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const allSuccess = files.length > 0 && files.every((f) => f.status === 'success');
  const anyUploading = files.some((f) => f.status === 'uploading');
  const canUpload = files.length > 0 && !anyUploading && !allSuccess;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upload Documents</h2>
          <p className="text-muted-foreground">Step 2 of 3 - Required Documentation</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Document Submission</CardTitle>
          <CardDescription>
            Upload all required documents for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploadDocuments.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadDocuments.error instanceof Error
                  ? uploadDocuments.error.message
                  : 'Failed to upload documents. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supported formats: PDF, JPG, PNG, DOC, DOCX
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Selected Files ({files.length})</h4>
              {files.map((fileWithProgress, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="shrink-0">
                    {fileWithProgress.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : fileWithProgress.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : fileWithProgress.status === 'uploading' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <File className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(fileWithProgress.file.size / 1024).toFixed(1)} KB
                    </p>
                    {fileWithProgress.status === 'uploading' && (
                      <Progress value={fileWithProgress.progress} className="mt-2 h-1" />
                    )}
                  </div>
                  {fileWithProgress.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              size="lg"
              className="flex-1"
            >
              {anyUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : allSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Upload Complete
                </>
              ) : (
                'Upload Documents'
              )}
            </Button>
          </div>

          {files.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select at least one document to continue.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
