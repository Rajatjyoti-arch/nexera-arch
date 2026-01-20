import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Camera, Flashlight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScanPaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScanPaySheet({ open, onOpenChange }: ScanPaySheetProps) {
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (open) {
      // Simulate scanner startup
      const timer = setTimeout(() => setScanning(true), 500);
      return () => clearTimeout(timer);
    } else {
      setScanning(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 bg-black">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan QR Code
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Scanner Area */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Simulated camera view */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />
            
            {/* Scan frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-64 h-64"
            >
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-violet-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-violet-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-violet-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-violet-500 rounded-br-xl" />

              {/* Scanning line */}
              {scanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                />
              )}

              {/* Center QR hint */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-white/20 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Place QR code here</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Controls */}
          <div className="p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-8 mb-6">
              <button
                onClick={() => setFlashOn(!flashOn)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                  flashOn ? "bg-yellow-500/20 text-yellow-400" : "text-white/60 hover:text-white"
                )}
              >
                <Flashlight className="h-6 w-6" />
                <span className="text-xs">Flash</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-white/60 hover:text-white transition-colors">
                <Camera className="h-6 w-6" />
                <span className="text-xs">Gallery</span>
              </button>
            </div>

            <p className="text-center text-white/50 text-sm">
              Scan any UPI QR code to make instant payments
            </p>

            <p className="text-center text-white/30 text-xs mt-4">
              Demo mode: Camera not available
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
