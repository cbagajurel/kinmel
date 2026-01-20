import React from "react";
import SidebarWrapper from "./_components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-black h-full min-h-screen">
      {/* sidebar*/}

      <aside className="p-4 border-r border-r-slate-800 w-[280px] min-w-[250px] max-w-[300px] text-whtie">
        <div className="top-0 sticky">
          <SidebarWrapper />
        </div>
      </aside>
      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
