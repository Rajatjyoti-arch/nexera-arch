import { FileText, Image as ImageIcon, Table, File, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MessageAttachmentProps {
  url: string;
  type: string;
  name: string;
  isOwn?: boolean;
}

export function MessageAttachment({ url, type, name, isOwn = false }: MessageAttachmentProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = type === 'image' || type?.startsWith('image/');

  const getIcon = () => {
    if (isImage) return ImageIcon;
    if (type?.includes('pdf') || type?.includes('text')) return FileText;
    if (type?.includes('excel') || type?.includes('spreadsheet')) return Table;
    return File;
  };

  const Icon = getIcon();

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  if (isImage && !imageError) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-w-[280px]">
        <img
          src={url}
          alt={name}
          className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div className={cn(
          "flex items-center justify-between px-2 py-1.5 text-[10px]",
          isOwn ? "text-black/70" : "text-foreground/60"
        )}>
          <span className="truncate max-w-[200px]">{name}</span>
          <button 
            onClick={handleDownload}
            className="hover:opacity-70 transition-opacity"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // File attachment (non-image or image load failed)
  return (
    <div className={cn(
      "mt-2 flex items-center gap-3 p-3 rounded-lg border max-w-[280px]",
      isOwn 
        ? "bg-black/10 border-black/20" 
        : "bg-secondary/50 border-border"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        isOwn ? "bg-black/20" : "bg-secondary"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isOwn ? "text-black/70" : "text-foreground/70"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs font-medium truncate",
          isOwn ? "text-black" : "text-foreground"
        )}>
          {name}
        </p>
        <p className={cn(
          "text-[10px]",
          isOwn ? "text-black/60" : "text-foreground/50"
        )}>
          {type?.split('/')[1]?.toUpperCase() || 'FILE'}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg",
            isOwn 
              ? "text-black/70 hover:bg-black/10" 
              : "text-foreground/70 hover:bg-secondary"
          )}
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg",
            isOwn 
              ? "text-black/70 hover:bg-black/10" 
              : "text-foreground/70 hover:bg-secondary"
          )}
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
