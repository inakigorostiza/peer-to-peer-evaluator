"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

interface ExcelUploadProps {
  endpoint: string;
  courseId: string;
  label: string;
  accept?: string;
  onSuccess?: () => void;
}

interface UploadError {
  row: number;
  message: string;
}

export function ExcelUpload({
  endpoint,
  courseId,
  label,
  accept = ".csv,.xlsx,.xls",
  onSuccess,
}: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file || !courseId) return;

    setUploading(true);
    setErrors([]);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([{ row: 0, message: data.error || "Upload failed" }]);
        }
        return;
      }

      setSuccess(data.message || "Import successful!");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess?.();
    } catch {
      setErrors([{ row: 0, message: "Network error. Please try again." }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setErrors([]);
              setSuccess(null);
            }}
            className="hidden"
            id={`upload-${label}`}
          />
          <label
            htmlFor={`upload-${label}`}
            className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground hover:border-foreground/50 transition-colors"
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-foreground">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Choose {label} file (.csv, .xlsx)</span>
              </>
            )}
          </label>
        </div>
        <Button onClick={handleUpload} disabled={!file || !courseId || uploading} size="sm">
          {uploading ? "Uploading..." : "Import"}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-sm font-medium text-destructive">
              {errors.length} validation error{errors.length > 1 ? "s" : ""}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-destructive/80 max-h-40 overflow-y-auto">
            {errors.map((err, i) => (
              <li key={i}>
                {err.row > 0 ? `Row ${err.row}: ` : ""}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
