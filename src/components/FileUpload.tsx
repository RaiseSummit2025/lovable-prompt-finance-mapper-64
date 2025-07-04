import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileUpload, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  }, []);

  const validateAndUpload = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB');
      return;
    }

    onFileUpload(file);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-financial">
        <CardContent className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {isProcessing ? (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isProcessing ? "Processing..." : "Upload Trial Balance File"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: .xlsx, .xls, .csv (max 10MB)
                </p>
              </div>
              
              {!isProcessing && (
                <Button variant="outline" className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">Expected File Format:</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Date/Period:</strong> Month/Year or specific dates</p>
            <p>• <strong>Account Number:</strong> Unique account identifier</p>
            <p>• <strong>Account Description:</strong> Account name/description</p>
            <p>• <strong>Debit:</strong> Debit amounts</p>
            <p>• <strong>Credit:</strong> Credit amounts</p>
            <p>• <strong>Balance:</strong> Net balance (Debit - Credit)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};