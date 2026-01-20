import { Grip, LayoutPanelLeft } from "lucide-react";
import React from "react";
import SidebarItems from "./sidebar.items";
import SidebarMenu from "./sidebar.menu";

const SidebarWrapper = () => {
  return (
    <div className="text-white">
      {/*Shop Details*/}
      <div className="flex items-center mt-2 ml-3">
        <div className="flex justify-center items-center mr-4 border border-gray-500 rounded-md w-9 h-9">
          <Grip className="size-5 text-gray-500" />
        </div>

        <div>
          <span className="font-md font-semibold">Nepast Shop</span>
          <p className="text-gray-500 text-xs">Kalanki, Kathmandu</p>
        </div>
      </div>
      {/* */}
      <div className="mx-2 mt-6">
        <SidebarItems
          label={"Dashboard"}
          isActive={true}
          icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
        />

        {/* Main Menu */}
        <SidebarMenu title="Main Menu">
          <SidebarItems
            label={"Orders"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"Payments"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
        </SidebarMenu>
        {/* Products */}
        <SidebarMenu title="Products">
          <SidebarItems
            label={"Create Product"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"All Products"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
        </SidebarMenu>

        {/* Events */}
        <SidebarMenu title="Events">
          <SidebarItems
            label={"Create Event"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"All Ecents"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
        </SidebarMenu>
        {/* Controllers */}
        <SidebarMenu title="Controllers">
          <SidebarItems
            label={"Inbox"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"Settings"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"Notification"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
        </SidebarMenu>
        {/* Extras */}
        <SidebarMenu title="Main Menu">
          <SidebarItems
            label={"Discount Codes"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
          <SidebarItems
            label={"Logout"}
            isActive={false}
            icon={<LayoutPanelLeft className="size-5 text-gray-300" />}
          />
        </SidebarMenu>
      </div>
    </div>
  );
};

export default SidebarWrapper;
