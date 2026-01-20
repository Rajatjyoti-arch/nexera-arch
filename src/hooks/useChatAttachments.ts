import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

export function useChatAttachments(chatId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const uploadAttachment = useMutation({
    mutationFn: async (file: File): Promise<{ url: string; type: string; name: string }> => {
      if (!user?.id || !chatId) throw new Error('Not authenticated or no chat selected');

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('File type not supported');
      }

      // Create unique file path: user_id/chat_id/timestamp_filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${chatId}/${timestamp}_${sanitizedName}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get the signed URL for private bucket
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7 day expiry

      if (urlError) throw urlError;

      return {
        url: signedUrlData.signedUrl,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
      };
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
      setUploadProgress(null);
    },
    onSuccess: () => {
      setUploadProgress(null);
    },
  });

  const sendMessageWithAttachment = useMutation({
    mutationFn: async ({ 
      content, 
      attachmentUrl, 
      attachmentType, 
      attachmentName 
    }: { 
      content: string; 
      attachmentUrl: string; 
      attachmentType: string;
      attachmentName: string;
    }) => {
      if (!user?.id || !chatId) throw new Error('Not authenticated or no chat selected');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          attachment_name: attachmentName,
        })
        .select()
        .single();

      if (error) throw error;

      // Update chat's updated_at
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
    },
  });

  const handleFileSelect = async (file: File): Promise<{ url: string; type: string; name: string } | null> => {
    try {
      const result = await uploadAttachment.mutateAsync(file);
      return result;
    } catch {
      return null;
    }
  };

  return {
    uploadAttachment,
    sendMessageWithAttachment,
    handleFileSelect,
    uploadProgress,
    isUploading: uploadAttachment.isPending,
  };
}

// Helper to get file icon based on type
export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('word') || type.includes('document')) return 'file-text';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'table';
  return 'file';
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
