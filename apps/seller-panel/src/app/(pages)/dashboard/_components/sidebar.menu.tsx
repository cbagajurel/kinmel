import React from "react";

const SidebarMenu = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <p className="text-gray-500 text-xs">{title}</p>
      {children}
    </div>
  );
};

export default SidebarMenu;
