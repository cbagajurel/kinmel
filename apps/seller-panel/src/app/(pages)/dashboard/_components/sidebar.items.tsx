import React from "react";

const SidebarItems = ({
  label,
  isActive,
  icon,
}: {
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
}) => {
  return (
    <div
      className={`px-4 py-3 rounded-md flex items-center gap-3 cursor-pointer transition-colors ${
        isActive
          ? "bg-blue-800/40 hover:bg-blue-800/35"
          : "hover:bg-gray-600/40"
      }`}
    >
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  );
};

export default SidebarItems;
