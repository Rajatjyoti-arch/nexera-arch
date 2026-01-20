import { useRef, useState } from 'react';
import { Paperclip, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/hooks/useChatAttachments';

interface AttachmentButtonProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  pendingFile: File | null;
  onClearPending: () => void;
}

export function AttachmentButton({ 
  onFileSelect, 
  isUploading, 
  pendingFile,
  onClearPending 
}: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />

      {/* Pending file preview */}
      {pendingFile && (
        <div className="absolute -top-16 left-0 right-0 mx-4 p-3 bg-secondary/90 backdrop-blur-sm rounded-xl border border-border flex items-center gap-3">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : pendingFile.type.startsWith('image/') ? (
            <ImageIcon className="w-5 h-5 text-foreground/70" />
          ) : (
            <Paperclip className="w-5 h-5 text-foreground/70" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{pendingFile.name}</p>
            <p className="text-[10px] text-foreground/60">{formatFileSize(pendingFile.size)}</p>
          </div>
          {!isUploading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg"
              onClick={onClearPending}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Attachment dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-xl hover:bg-secondary btn-press border border-border text-foreground/80 hover:text-foreground/90"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleImageClick} className="gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Photo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFileClick} className="gap-2">
            <Paperclip className="w-4 h-4" />
            <span>Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
