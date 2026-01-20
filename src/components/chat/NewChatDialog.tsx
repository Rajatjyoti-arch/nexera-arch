import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  User, 
  X, 
  Loader2, 
  MessageCircle,
  GraduationCap,
  Briefcase,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserSearch, SearchableUser } from "@/hooks/useUserSearch";
import { useFindOrCreateDirectChat, useCreateChat } from "@/hooks/useChat";
import { toast } from "sonner";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string) => void;
}

const roleConfig = {
  student: { icon: GraduationCap, label: "Student", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  faculty: { icon: Briefcase, label: "Faculty", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  admin: { icon: Shield, label: "Admin", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [tab, setTab] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SearchableUser[]>([]);
  const [groupName, setGroupName] = useState("");
  
  const { results: searchResults, isLoading: searchLoading } = useUserSearch(searchQuery);
  const findOrCreateDirectChat = useFindOrCreateDirectChat();
  const createGroupChat = useCreateChat();

  const handleSelectUser = (user: SearchableUser) => {
    if (tab === "direct") {
      // For direct chat, immediately create/find the chat
      handleCreateDirectChat(user);
    } else {
      // For group, toggle selection
      setSelectedUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.filter(u => u.id !== user.id);
        }
        return [...prev, user];
      });
    }
  };

  const handleCreateDirectChat = async (user: SearchableUser) => {
    try {
      const chat = await findOrCreateDirectChat.mutateAsync(user.id);
      toast.success(`Chat with ${user.name} opened`);
      onChatCreated(chat.id);
      handleClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const handleCreateGroupChat = async () => {
    if (selectedUsers.length < 2) {
      toast.error('Please select at least 2 members for a group');
      return;
    }
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const chat = await createGroupChat.mutateAsync({
        type: 'group',
        participantIds: selectedUsers.map(u => u.id),
        name: groupName.trim(),
      });
      toast.success(`Group "${groupName}" created`);
      onChatCreated(chat.id);
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setTab("direct");
    onOpenChange(false);
  };

  const isUserSelected = (userId: string) => selectedUsers.some(u => u.id === userId);
  const isPending = findOrCreateDirectChat.isPending || createGroupChat.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle className="w-5 h-5 text-primary" />
            New Conversation
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "direct" | "group")} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="direct" className="gap-2 text-xs font-semibold">
                <User className="w-4 h-4" />
                Direct Message
              </TabsTrigger>
              <TabsTrigger value="group" className="gap-2 text-xs font-semibold">
                <Users className="w-4 h-4" />
                Create Group
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Group name input */}
          {tab === "group" && (
            <div className="px-6 pt-4">
              <Input
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-11"
              />
            </div>
          )}

          {/* Selected users for group */}
          {tab === "group" && selectedUsers.length > 0 && (
            <div className="px-6 pt-3">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <Badge 
                    key={user.id} 
                    variant="secondary"
                    className="gap-1.5 pl-1 pr-2 py-1 cursor-pointer hover:bg-destructive/10"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-[8px] font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name.split(' ')[0]}</span>
                    <X className="w-3 h-3 text-foreground/50 hover:text-destructive" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search input */}
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <TabsContent value="direct" className="mt-0">
            <UserSearchResults
              users={searchResults}
              isLoading={searchLoading}
              searchQuery={searchQuery}
              onSelect={handleSelectUser}
              selectedIds={[]}
              isPending={isPending}
            />
          </TabsContent>

          <TabsContent value="group" className="mt-0">
            <UserSearchResults
              users={searchResults}
              isLoading={searchLoading}
              searchQuery={searchQuery}
              onSelect={handleSelectUser}
              selectedIds={selectedUsers.map(u => u.id)}
              isPending={isPending}
            />
            
            {/* Create group button */}
            <div className="p-4 border-t border-border">
              <Button 
                onClick={handleCreateGroupChat}
                disabled={selectedUsers.length < 2 || !groupName.trim() || isPending}
                className="w-full h-11 font-semibold"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Create Group ({selectedUsers.length} members)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface UserSearchResultsProps {
  users: SearchableUser[];
  isLoading: boolean;
  searchQuery: string;
  onSelect: (user: SearchableUser) => void;
  selectedIds: string[];
  isPending: boolean;
}

function UserSearchResults({ 
  users, 
  isLoading, 
  searchQuery, 
  onSelect, 
  selectedIds,
  isPending 
}: UserSearchResultsProps) {
  if (searchQuery.length < 2) {
    return (
      <div className="p-8 text-center">
        <Search className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
        <p className="text-sm text-foreground/60 font-medium">Start typing to search</p>
        <p className="text-xs text-foreground/40 mt-1">Search by name or email</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <User className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
        <p className="text-sm text-foreground/60 font-medium">No users found</p>
        <p className="text-xs text-foreground/40 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-64">
      <div className="p-2">
        {users.map(user => {
          const config = roleConfig[user.role];
          const RoleIcon = config.icon;
          const isSelected = selectedIds.includes(user.id);

          return (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              disabled={isPending}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                "hover:bg-secondary/50 disabled:opacity-50",
                isSelected && "bg-primary/10 border border-primary/20"
              )}
            >
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-xs font-bold bg-secondary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground/90 truncate">
                    {user.name}
                  </p>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", config.color)}>
                    <RoleIcon className="w-2.5 h-2.5 mr-1" />
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/50 truncate">
                  {user.email}
                </p>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
