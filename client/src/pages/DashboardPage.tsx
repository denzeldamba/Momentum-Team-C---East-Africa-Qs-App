import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../Components/ui/button'; 

// Mock Data for demonstration purposes in the presentation
const mockProjects = [
    { id: 1, name: "Nairobi Expressway Phase 3", location: "Nairobi County", status: "Ongoing", lastUpdated: "5 mins ago" },
    { id: 2, name: "Kisumu Port Reconstruction", location: "Kisumu County", status: "Draft", lastUpdated: "1 day ago" },
    { id: 3, name: "Affordable Housing Project (Unit C)", location: "Mombasa County", status: "Completed", lastUpdated: "1 week ago" },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Project Dashboard</h2>
        <Button 
            onClick={() => alert("Simulating Project Creation...")} 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus size={20} />
          <span>New Project</span>
        </Button>
      </div>

      {/* Project List / Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Project Name', 'Location', 'Status', 'Last Updated', 'Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {mockProjects.map(project => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                  {project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {project.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'Draft' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {project.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 text-sm text-center text-gray-500 dark:text-gray-400">
            *Offline data read successful. Sync status: OK. (Demonstrates Phase 1: Offline Core)
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;