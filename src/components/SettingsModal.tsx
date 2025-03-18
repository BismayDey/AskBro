import React from "react";
import { motion } from "framer-motion";
import { X, Moon, Sun, Monitor, Type, Layout, Volume2 } from "lucide-react";
import { Theme, UserSettings } from "../types";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../lib/firebase";
import toast from "react-hot-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  userId: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  userId,
}) => {
  const handleSettingChange = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    try {
      await updateDoc(doc(firestore, `users/${userId}`), {
        settings: updatedSettings,
      });
      onUpdateSettings(updatedSettings);
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleSettingChange({ theme })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    settings.theme === theme
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {theme === "light" && <Sun size={18} />}
                  {theme === "dark" && <Moon size={18} />}
                  {theme === "system" && <Monitor size={18} />}
                  <span className="capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleSettingChange({ fontSize: size })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    settings.fontSize === size
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Type
                    size={size === "small" ? 14 : size === "medium" ? 18 : 22}
                  />
                  <span className="capitalize">{size}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Spacing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["compact", "comfortable", "spacious"] as const).map(
                (spacing) => (
                  <button
                    key={spacing}
                    onClick={() =>
                      handleSettingChange({ messageSpacing: spacing })
                    }
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                      settings.messageSpacing === spacing
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Layout size={18} />
                    <span className="capitalize">{spacing}</span>
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sound
            </label>
            <button
              onClick={() =>
                handleSettingChange({ soundEnabled: !settings.soundEnabled })
              }
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border w-full transition-colors ${
                settings.soundEnabled
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <Volume2 size={18} />
              <span>{settings.soundEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
