import React from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { auth } from "../lib/firebase";
import { User as FirebaseUser } from "firebase/auth"; // Import User type from Firebase

interface UserProfileProps {
  user: FirebaseUser | null;
  onOpenSettings: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onOpenSettings,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <div className="relative group">
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {user?.photoURL ? (
            <img
              src={user.photoURL ?? ""}
              alt={user.displayName ?? user.email ?? "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.displayName || user?.email?.split("@")[0] || "Guest"}
          </span>
        </button>

        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 hidden group-hover:block">
          <button
            onClick={onOpenSettings}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={() => auth.signOut()}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </motion.div>
  );
};
