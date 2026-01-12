import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../Components/ui/button';

const mockProjects = [
  { id: 1, name: "Nairobi Expressway Phase 3", location: "Nairobi County", status: "Ongoing", lastUpdated: "5 mins ago" },
  { id: 2, name: "Kisumu Port Reconstruction", location: "Kisumu County", status: "Draft", lastUpdated: "1 day ago" },
  { id: 3, name: "Affordable Housing Project (Unit C)", location: "Mombasa County", status: "Completed", lastUpdated: "1 week ago" },
  { id: 4, name: "Thika Road Underpass Survey", location: "Kiambu County", status: "Archived", lastUpdated: "2 months ago" },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Project Dashboard</h2>

        <Button
          onClick={() => console.log("New Project Logic...")}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg transition transform active:scale-95"
        >
          <Plus size={20} />
          <span>New Project</span>
        </Button>
      </div>

      {/* Project Table Container - MOBILE RESPONSIVE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto"> {/* Enable horizontal scroll on small phones */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                {['Project Name', 'Location', 'Status', 'Updated', 'Actions'].map(header => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {header}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {mockProjects.map(project => {
                let statusClass = '';
                if (project.status === 'Ongoing') statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-800/30 dark:text-amber-300';
                else if (project.status === 'Draft') statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300';
                else if (project.status === 'Completed') statusClass = 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300';
                else statusClass = 'bg-gray-100 text-gray-600 dark:bg-gray-600/30 dark:text-gray-400';

                return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-600 dark:text-amber-400 group-hover:underline cursor-pointer">
                        {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {project.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${statusClass}`}>
                        {project.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500">
                        {project.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">View Details</button>
                    </td>
                    </tr>
                )
                })}
            </tbody>
            </table>
        </div>
        {/* Footer info - Mobile responsive text */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/70 text-[10px] sm:text-xs text-center text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 italic">
          *Offline core active. Local database synchronized with Supabase cloud.
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;