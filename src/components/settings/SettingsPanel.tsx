import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Sun,
  Bell,
  MessageSquare,
  Clock,
  Volume2,
  Loader2,
  X,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, isSaving } = useSettings();

  const notificationSettings = [
    {
      key: 'notifications_notices' as const,
      label: 'Notices',
      description: 'Get notified about new announcements',
      icon: Bell,
    },
    {
      key: 'notifications_messages' as const,
      label: 'Messages',
      description: 'Get notified about new messages',
      icon: MessageSquare,
    },
    {
      key: 'notifications_reminders' as const,
      label: 'Reminders',
      description: 'Get class and deadline reminders',
      icon: Clock,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-xs text-foreground/70">Customize your experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-foreground/60 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Theme Section */}
          <section>
            <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-4">
              Appearance
            </h3>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border-2 border-primary">
              <Sun className="w-5 h-5 text-primary" />
              <div>
                <span className="text-sm font-bold text-primary">Light Mode</span>
                <p className="text-[10px] text-foreground/60">The app uses light theme</p>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-4">
              Notifications
            </h3>
            <div className="space-y-4">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <setting.icon className="w-4 h-4 text-foreground/60" />
                    <div>
                      <Label className="text-sm font-bold">{setting.label}</Label>
                      <p className="text-[10px] text-foreground/60">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[setting.key]}
                    onCheckedChange={(checked) => updateSettings({ [setting.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Sound Effects Section */}
          <section>
            <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-4">
              Sounds
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-foreground/60" />
                <div>
                  <Label className="text-sm font-bold">Sound Effects</Label>
                  <p className="text-[10px] text-foreground/60">Play sounds for actions</p>
                </div>
              </div>
              <Switch
                checked={settings.sound_effects}
                onCheckedChange={(checked) => updateSettings({ sound_effects: checked })}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/5">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
