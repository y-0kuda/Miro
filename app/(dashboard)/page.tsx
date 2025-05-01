import DashboardPage from "./_components/dashboard-page";

interface PageProps {
  searchParams: {
    search?: string;
    favorites?: string;
  };
}

const Page = ({ searchParams }: PageProps) => {
  return <DashboardPage searchParams={searchParams} />;
}

export default Page;
