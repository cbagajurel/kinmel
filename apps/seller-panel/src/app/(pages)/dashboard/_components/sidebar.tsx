"use client";
import { Grip, LayoutPanelLeft } from "lucide-react";
import React, { useEffect } from "react";
import SidebarItems from "./sidebar.items";
import SidebarMenu from "./sidebar.menu";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import { useSeller } from "@/hooks/useSeller";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";
  return (
    <div className="text-white">
      {/*Shop Details*/}
      <div className="flex items-center mt-2 ml-3">
        <div className="flex justify-center items-center mr-4 border border-gray-500 rounded-md w-9 h-9">
          <Grip className={`size-5 text-gray-500`} />
        </div>

        <div>
          <span className="font-md font-semibold">{seller?.shop?.name}</span>
          <p className="text-gray-500 text-xs">{seller?.shop?.address}</p>
        </div>
      </div>
      {/* */}
      <div className="mx-2 mt-6">
        <SidebarItems
          label={"Dashboard"}
          isActive={activeSidebar === "/dashboard"}
          icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          href="/dashboard"
        />

        {/* Main Menu */}
        <SidebarMenu title="Main Menu">
          <SidebarItems
            label={"Orders"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"Payments"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
        </SidebarMenu>
        {/* Products */}
        <SidebarMenu title="Products">
          <SidebarItems
            label={"Create Product"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"All Products"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
        </SidebarMenu>

        {/* Events */}
        <SidebarMenu title="Events">
          <SidebarItems
            label={"Create Event"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"All Ecents"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
        </SidebarMenu>
        {/* Controllers */}
        <SidebarMenu title="Controllers">
          <SidebarItems
            label={"Inbox"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"Settings"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"Notification"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
        </SidebarMenu>
        {/* Extras */}
        <SidebarMenu title="Main Menu">
          <SidebarItems
            label={"Discount Codes"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
          <SidebarItems
            label={"Logout"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
            href="/dashboard"
          />
        </SidebarMenu>
      </div>
    </div>
  );
};

export default SidebarWrapper;
