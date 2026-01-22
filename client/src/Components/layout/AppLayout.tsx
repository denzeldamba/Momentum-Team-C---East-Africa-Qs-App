import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="
      min-h-screen
      bg-white dark:bg-zinc-950
      text-zinc-900 dark:text-zinc-100
      transition-colors
    ">
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
