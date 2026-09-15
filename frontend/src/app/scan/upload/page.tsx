'use client';
import { Button } from '@/components/ui/Button';
import { Upload } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Upload Package Images</h1>
      
      <div className="border-2 border-dashed border-cyan-brand/30 rounded-lg p-12 text-center hover:bg-cyan-soft transition-colors cursor-pointer bg-white">
        <Upload className="mx-auto h-12 w-12 text-cyan-brand mb-4" />
        <p className="text-lg font-medium text-slate-700">Drag & drop images here</p>
        <p className="text-sm text-slate-500 mt-1">or click to browse</p>
        <p className="text-xs text-slate-400 mt-4">Accepts JPEG/PNG up to 10MB</p>
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg">Upload & Analyze</Button>
      </div>
    </div>
  );
}
