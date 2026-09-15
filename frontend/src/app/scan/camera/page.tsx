'use client';
import { Button } from '@/components/ui/Button';

export default function CameraPage() {
  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-xl font-bold mb-4">Scan Package Label</h1>
      <div className="flex-1 bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
        {/* Placeholder for camera stream */}
        <div className="text-white text-sm text-center p-4">
          <p>Camera Stream Placeholder</p>
          <p className="text-gray-400 mt-2 text-xs">Align the package panel within the frame</p>
        </div>
        
        {/* Viewfinder overlay */}
        <div className="absolute inset-8 border-2 border-dashed border-cyan-bright/70 rounded-lg pointer-events-none"></div>
      </div>
      
      <div className="mt-4 flex flex-col gap-4">
        <select className="p-2 border rounded-md">
          <option>Principal Display Panel</option>
          <option>Side Panel</option>
          <option>Back Panel</option>
        </select>
        <Button size="lg" className="w-full">Capture Image</Button>
      </div>
    </div>
  );
}
