import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../utils/api.js';

const COLORS = {
  'Contact Made': '#f59e0b',
  'Active': '#10b981',
  'Completed': '#3b82f6',
  'Stalled': '#ef4444',
  'Cancelled': '#6b7280',
  'High': '#dc2626',
  'Medium': '#f59e0b',
  'Low': '#3b82f6',
};

const ProjectAnalysis = () => {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects-analysis'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-analysis'],
    queryFn: async () => {
      const { data } = await api.get('/employees');
      return data;
    },
  });

  const projects = projectsData?.projects || [];

  const analytics = useMemo(() => {
    // Status breakdown
    const statusBreakdown = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    // Priority breakdown
    const priorityBreakdown = projects.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {});

    // Employee workload
    const employeeWorkload = employees.map(emp => ({
      name: emp.name,
      projects: projects.filter(p => p.assignees?.some(a => a._id === emp._id)).length,
      hours: projects
        .filter(p => p.assignees?.some(a => a._id === emp._id))
        .reduce((sum, p) => sum + (p.totalHoursSpent || 0), 0)
    })).filter(e => e.projects > 0);

    // Project type breakdown
    const typeBreakdown = projects.reduce((acc, project) => {
      const type = project.projectType || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Client type breakdown
    const clientTypeBreakdown = projects.reduce((acc, project) => {
      acc[project.clientType] = (acc[project.clientType] || 0) + 1;
      return acc;
    }, {});

    return {
      statusBreakdown,
      priorityBreakdown,
      employeeWorkload,
      typeBreakdown,
      clientTypeBreakdown,
      totalProjects: projects.length,
      totalHours: projects.reduce((sum, p) => sum + (p.totalHoursSpent || 0), 0),
      avgHoursPerProject: projects.length > 0 
        ? (projects.reduce((sum, p) => sum + (p.totalHoursSpent || 0), 0) / projects.length).toFixed(1)
        : 0,
      unassignedProjects: projects.filter(p => !p.assigned).length,
    };
  }, [projects, employees]);

  const statusChartData = Object.entries(analytics.statusBreakdown).map(([name, value]) => ({ name, value }));
  const priorityChartData = Object.entries(analytics.priorityBreakdown).map(([name, value]) => ({ name, value }));
  const typeChartData = Object.entries(analytics.typeBreakdown).map(([name, value]) => ({ name, value }));

  if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Project Analysis</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Hours Logged</div>
          <div className="text-3xl font-bold text-sky-500 mt-2">{analytics.totalHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Avg Hours/Project</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{analytics.avgHoursPerProject}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Unassigned Projects</div>
          <div className="text-3xl font-bold text-red-500 mt-2">{analytics.unassignedProjects}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={statusChartData} 
                innerRadius={60} 
                outerRadius={100} 
                dataKey="value" 
                paddingAngle={5}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusChartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects by Priority</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={priorityChartData} 
                innerRadius={60} 
                outerRadius={100} 
                dataKey="value" 
                paddingAngle={5}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {priorityChartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Workload */}
      {analytics.employeeWorkload.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Workload</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.employeeWorkload}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#0ea5e9" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="projects" fill="#0ea5e9" name="Projects" />
              <Bar yAxisId="right" dataKey="hours" fill="#10b981" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Project Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {typeChartData.map((item) => (
            <div key={item.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-600 mt-1">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Type Distribution</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(analytics.clientTypeBreakdown).map(([type, count]) => (
            <div key={type} className="p-6 border border-gray-200 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 mt-2">{type} Clients</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Insights */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-sky-500 mr-2">•</span>
            <span className="text-gray-700">
              {analytics.statusBreakdown['Active'] || 0} projects are currently active
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-500 mr-2">•</span>
            <span className="text-gray-700">
              {analytics.statusBreakdown['Completed'] || 0} projects have been completed
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-500 mr-2">•</span>
            <span className="text-gray-700">
              {analytics.statusBreakdown['Contact Made'] || 0} new project requests pending
            </span>
          </li>
          {analytics.unassignedProjects > 0 && (
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                {analytics.unassignedProjects} projects need to be assigned to employees
              </span>
            </li>
          )}
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span className="text-gray-700">
              Average of {analytics.avgHoursPerProject} hours per project
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectAnalysis;
