import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import api from '../utils/api.js';

export default function ClientPortal() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    projectDescription: '',
    projectType: '',
    estHoursRequired: '',
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['myProjects', user?.id],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (projectData) => {
      const res = await api.post('/projects', projectData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects', user?.id] });
      setShowForm(false);
      setFormData({
        clientName: user?.name || '',
        projectDescription: '',
        projectType: '',
        estHoursRequired: '',
      });
      alert('Project submitted successfully! Admin will review it.');
    },
    onError: (error) => {
      alert('Failed to submit project: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectDescription.trim()) {
      alert('Please describe your project');
      return;
    }
    createProject.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const projects = projectsData?.projects || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name}!</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            showForm 
              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Project Request'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Project</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe your project in detail: goals, requirements, timeline expectations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  placeholder="e.g., Website, App, Audit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estHoursRequired"
                  value={formData.estHoursRequired}
                  onChange={handleChange}
                  min="0"
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createProject.isPending}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  createProject.isPending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } text-white`}
              >
                {createProject.isPending ? 'Submitting...' : 'Submit Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Projects</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="p-6 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{project.clientName}</h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">
                      {project.projectDescription}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      {project.projectType && <span>Type: {project.projectType}</span>}
                      <span>Priority: {project.priority}</span>
                      {project.estHoursRequired > 0 && <span>Est. Hours: {project.estHoursRequired}</span>}
                      {project.startDate && (
                        <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        project.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : project.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : project.status === 'Contact Made'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No projects yet. Click "New Project Request" to submit your first project.
          </p>
        )}
      </div>
    </div>
  );
}
