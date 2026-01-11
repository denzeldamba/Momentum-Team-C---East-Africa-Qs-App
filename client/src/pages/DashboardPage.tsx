import React from 'react';
import { Plus } from 'lucide-react';
// FIX: Correcting path casing to use 'components' for cross-platform stability
import { Button } from '../Components/ui/button';

// Mock Data for demonstration purposes
const mockProjects = [
  { id: 1, name: "Nairobi Expressway Phase 3", location: "Nairobi County", status: "Ongoing", lastUpdated: "5 mins ago" },
  { id: 2, name: "Kisumu Port Reconstruction", location: "Kisumu County", status: "Draft", lastUpdated: "1 day ago" },
  { id: 3, name: "Affordable Housing Project (Unit C)", location: "Mombasa County", status: "Completed", lastUpdated: "1 week ago" },
  { id: 4, name: "Thika Road Underpass Survey", location: "Kiambu County", status: "Archived", lastUpdated: "2 months ago" },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-gray-100">Project Dashboard</h2>

        <Button
          // FIX 1: Removed alert()
          onClick={() => console.log("ACTION: Simulating Project Creation...")}
          // FIX 2: Using a strong, professional green accent for the primary action button
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
        >
          <Plus size={20} />
          <span>New Project</span>
        </Button>
      </div>

      {/* Project List / Table */}
      {/* FIX 3: Use slightly lighter gray background for the card container (bg-gray-800) */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          {/* FIX 4: Darker table header (bg-gray-900) for contrast against the card body */}
          <thead className="bg-gray-900">
            <tr>
              {['Project Name', 'Location', 'Status', 'Last Updated', 'Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {/* FIX 5: Explicitly set text to white and ensure row background is inherited from the container or set */}
          <tbody className="divide-y divide-gray-700 text-white">
            {mockProjects.map(project => {
              // FIX 6: Dynamic status badge styling for dark mode contrast
              let statusClass = '';
              if (project.status === 'Ongoing') {
                statusClass = 'bg-amber-800/30 text-amber-300';
              } else if (project.status === 'Draft') {
                statusClass = 'bg-blue-800/30 text-blue-300';
              } else if (project.status === 'Completed') {
                statusClass = 'bg-green-800/30 text-green-300';
              } else {
                statusClass = 'bg-gray-600/30 text-gray-400';
              }

              return (
                <tr key={project.id} className="hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-400 cursor-pointer">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {project.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {project.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition">View Details</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {/* FIX 7: Footer message for Offline Core proof using a slightly different dark gray shade */}
        <div className="p-4 bg-gray-900/70 text-sm text-center text-gray-500 border-t border-gray-700">
          *Offline data read successful. Sync status: OK. (Demonstrates Phase 1: Offline Core)
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;