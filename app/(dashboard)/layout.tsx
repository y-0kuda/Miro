import { Sidebar } from "./_components/sidebar";
import { Navbar } from "./_components/sidebar/navbar";
import { OrgSideBar } from "./_components/sidebar/org-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <main className="h-full">
      <Sidebar />
      <div className="pl-[60px] h-full">
        {/* gap-x-3のため、OrgSideBarとメインの要素には少し間ができる */}
        <div className="flex gap-x-3 h-full">
          <OrgSideBar />
          {/* flex-1があてられると、伸縮しながら、残りのスペースを全て占める */}
          <div className="h-full flex-1">
            <Navbar />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
