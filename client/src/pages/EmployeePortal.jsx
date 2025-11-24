import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api.js';
import { useAuthStore } from '../stores/authStore.js';

const EmployeePortal = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch assigned projects
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['myAssignedProjects', user?.id],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { assigned: true } });
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Fetch daily updates for selected project
  const { data: updatesData } = useQuery({
    queryKey: ['projectUpdates', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const res = await api.get(`/projects/${selectedProject}/updates`);
      return res.data;
    },
    enabled: !!selectedProject,
  });

  // Submit daily update mutation
  const submitUpdate = useMutation({
    mutationFn: async (updateData) => {
      console.log('Submitting update:', {
        summary: updateData.summary,
        nextPlan: updateData.nextPlan,
        hoursLogged: updateData.hoursLogged,
        employee: user?.employeeRef,
        user: user
      });
      
      if (!user?.employeeRef) {
        throw new Error('Employee reference not found. Please logout and login again.');
      }
      
      const res = await api.post(`/projects/${updateData.project}/updates`, {
        summary: updateData.summary,
        nextPlan: updateData.nextPlan,
        hoursLogged: updateData.hoursLogged,
        employee: user.employeeRef,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectUpdates'] });
      queryClient.invalidateQueries({ queryKey: ['myAssignedProjects', user?.id] });
      reset();
      alert('Daily update submitted successfully!');
    },
    onError: (error) => {
      alert('Failed to submit update: ' + (error.response?.data?.message || error.message));
    },
  });

  const onSubmit = (data) => {
    if (!data.project) {
      alert('Please select a project');
      return;
    }
    submitUpdate.mutate(data);
  };

  const projects = projectsData?.projects || [];
  const updates = updatesData?.updates || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employee Portal</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Welcome, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-sky-500">{projects.length}</div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">Assigned Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-emerald-500">
            {projects.filter(p => p.status === 'Active').length}
          </div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">Active Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-amber-500">
            {projects.reduce((sum, p) => sum + (p.totalHoursSpent || 0), 0)}
          </div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">Total Hours Logged</div>
        </div>
      </div>

      {/* Assigned Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Assigned Projects</h2>
        </div>
        <div className="p-4 md:p-6">
          {isLoading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500">No projects assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">{project.clientName}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : project.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.projectDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Priority: {project.priority}</span>
                    <span>{project.totalHoursSpent || 0}h logged</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Daily Update */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Submit Daily Update</h2>
        </div>
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project *
              </label>
              <select
                {...register('project', { required: 'Project is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">Choose a project...</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.clientName} - {project.status}
                  </option>
                ))}
              </select>
              {errors.project && <span className="text-red-500 text-sm mt-1">{errors.project.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Summary *
              </label>
              <textarea
                {...register('summary', { required: 'Summary is required' })}
                rows={4}
                placeholder="What did you accomplish today?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
              />
              {errors.summary && <span className="text-red-500 text-sm mt-1">{errors.summary.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan for Tomorrow *
              </label>
              <textarea
                {...register('nextPlan', { required: 'Next plan is required' })}
                rows={3}
                placeholder="What will you work on next?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
              />
              {errors.nextPlan && <span className="text-red-500 text-sm mt-1">{errors.nextPlan.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Logged *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                {...register('hoursLogged', { 
                  required: 'Hours logged is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Hours must be positive' }
                })}
                placeholder="e.g., 8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {errors.hoursLogged && <span className="text-red-500 text-sm mt-1">{errors.hoursLogged.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitUpdate.isPending}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                submitUpdate.isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white`}
            >
              {submitUpdate.isPending ? 'Submitting...' : 'Submit Daily Update'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Updates */}
      {selectedProject && updates.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent Updates</h2>
          </div>
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {updates.slice(0, 5).map((update) => (
              <div key={update._id} className="border-l-4 border-sky-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(update.date || update.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">{update.hoursLogged}h</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{update.summary}</p>
                <p className="text-sm text-gray-500">Next: {update.nextPlan}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
