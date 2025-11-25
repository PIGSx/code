import React from "react";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
