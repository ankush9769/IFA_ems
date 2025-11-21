import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../utils/api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import InlineSelect from '../components/shared/InlineSelect.jsx';

const STATUS_OPTIONS = ['Contact Made', 'Active', 'Stalled', 'Completed', 'Cancelled'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

const fetchProjects = async (filters) => {
  const params = {};
  if (filters.status && filters.status !== 'All') params.status = filters.status;
  if (filters.priority && filters.priority !== 'All') params.priority = filters.priority;
  if (filters.assigned !== undefined) params.assigned = filters.assigned;
  
  const { data } = await api.get('/projects', { params });
  return data;
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'All', priority: 'All', assigned: undefined });
  const [editingCell, setEditingCell] = useState(null); // { projectId, field }
  const [assignModal, setAssignModal] = useState(null); // { projectId, currentAssignees }
  
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  });

  // Fetch all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data;
    },
  });

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async ({ projectId, updates }) => {
      const res = await api.put(`/projects/${projectId}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingCell(null);
    },
    onError: (error) => {
      alert('Failed to update: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleStatusChange = (projectId, newStatus) => {
    updateProject.mutate({ projectId, updates: { status: newStatus } });
  };

  const handlePriorityChange = (projectId, newPriority) => {
    updateProject.mutate({ projectId, updates: { priority: newPriority } });
  };

  const handleDateChange = (projectId, field, newDate) => {
    updateProject.mutate({ projectId, updates: { [field]: newDate } });
  };

  const handleAssignEmployees = (projectId, employeeIds) => {
    updateProject.mutate({ 
      projectId, 
      updates: { 
        assignees: employeeIds,
        assigned: employeeIds.length > 0,
        leadAssignee: employeeIds.length > 0 ? employeeIds[0] : null
      } 
    });
  };

  const projects = projectsData?.projects || [];
  
  const stats = useMemo(() => {
    return {
      total: projects.length,
      contactMade: projects.filter(p => p.status === 'Contact Made').length,
      active: projects.filter(p => p.status === 'Active').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      unassigned: projects.filter(p => !p.assigned).length,
      overdue: projects.filter(p => p.endDate && dayjs(p.endDate).isBefore(dayjs()) && p.status !== 'Completed').length,
    };
  }, [projects]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-sky-500">{stats.total}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-amber-500">{stats.contactMade}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">New Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-emerald-500">{stats.active}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-red-500">{stats.unassigned}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Unassigned</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-500">{stats.completed}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Completed</div>
        </div>
        {stats.overdue > 0 && (
          <div className="bg-red-50 rounded-lg shadow p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-red-800 text-xs md:text-sm mt-1">Overdue</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">All Projects</h2>
            <div className="flex flex-wrap gap-3">
              <InlineSelect
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                options={['All', 'Contact Made', 'Active', 'Completed', 'Cancelled', 'Stalled']}
              />
              <InlineSelect
                label="Priority"
                value={filters.priority}
                onChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
                options={['All', 'High', 'Medium', 'Low']}
              />
              <InlineSelect
                label="Assignment"
                value={filters.assigned === true ? 'Assigned' : filters.assigned === false ? 'Unassigned' : 'All'}
                onChange={(value) => setFilters((prev) => ({ 
                  ...prev, 
                  assigned: value === 'Assigned' ? true : value === 'Unassigned' ? false : undefined 
                }))}
                options={['All', 'Assigned', 'Unassigned']}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">No projects found</div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap font-medium text-gray-900 text-sm">{project.clientName}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 max-w-xs truncate text-gray-600 text-sm">
                      {project.projectDescription || '—'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-gray-600 text-sm">{project.projectType || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCell?.projectId === project._id && editingCell?.field === 'status' ? (
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project._id, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="px-2 py-1 border border-sky-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          onClick={() => setEditingCell({ projectId: project._id, field: 'status' })}
                          className="cursor-pointer hover:opacity-75"
                        >
                          <StatusBadge status={project.status} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCell?.projectId === project._id && editingCell?.field === 'priority' ? (
                        <select
                          value={project.priority}
                          onChange={(e) => handlePriorityChange(project._id, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="px-2 py-1 border border-sky-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {PRIORITY_OPTIONS.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingCell({ projectId: project._id, field: 'priority' })}
                          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-75 ${
                            project.priority === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : project.priority === 'Low' 
                              ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {project.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{project.assigned ? '✓' : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{project.leadAssignee?.name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCell?.projectId === project._id && editingCell?.field === 'startDate' ? (
                        <input
                          type="date"
                          defaultValue={project.startDate ? dayjs(project.startDate).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleDateChange(project._id, 'startDate', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="px-2 py-1 border border-sky-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingCell({ projectId: project._id, field: 'startDate' })}
                          className="cursor-pointer hover:text-sky-600 text-gray-600"
                        >
                          {project.startDate ? dayjs(project.startDate).format('DD MMM YY') : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCell?.projectId === project._id && editingCell?.field === 'endDate' ? (
                        <input
                          type="date"
                          defaultValue={project.endDate ? dayjs(project.endDate).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleDateChange(project._id, 'endDate', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="px-2 py-1 border border-sky-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingCell({ projectId: project._id, field: 'endDate' })}
                          className="cursor-pointer hover:text-sky-600 text-gray-600"
                        >
                          {project.endDate ? dayjs(project.endDate).format('DD MMM YY') : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAssignModal({ 
                            projectId: project._id, 
                            currentAssignees: project.assignees?.map(a => a._id) || [] 
                          })}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm transition-colors"
                        >
                          Assign
                        </button>
                        <Link 
                          to={`/projects/${project._id}`}
                          className="inline-block px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm no-underline transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assign Employees to Project</h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {employees.length === 0 ? (
                <p className="text-gray-500">No employees available</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((employee) => {
                    const isAssigned = assignModal.currentAssignees.includes(employee._id);
                    return (
                      <label
                        key={employee._id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          isAssigned 
                            ? 'bg-sky-50 border-sky-500' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            const newAssignees = e.target.checked
                              ? [...assignModal.currentAssignees, employee._id]
                              : assignModal.currentAssignees.filter(id => id !== employee._id);
                            setAssignModal({ ...assignModal, currentAssignees: newAssignees });
                          }}
                          className="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">
                            {employee.roleTitle || 'Employee'} • {employee.status}
                          </div>
                        </div>
                        {isAssigned && assignModal.currentAssignees[0] === employee._id && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                            Lead
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAssignEmployees(assignModal.projectId, assignModal.currentAssignees);
                  setAssignModal(null);
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

