import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../utils/api.js';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}`);
      return data;
    },
  });

  const { data: updatesData } = useQuery({
    queryKey: ['projectUpdates', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/updates`);
      return data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading project...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

  const updates = updatesData?.updates || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.clientName}</h1>
            <p className="text-gray-600 mt-2">{project.projectDescription}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-500">Priority</div>
            <div className="text-lg font-semibold text-gray-900">{project.priority}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Project Type</div>
            <div className="text-lg font-semibold text-gray-900">{project.projectType || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Start Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {project.startDate ? dayjs(project.startDate).format('DD MMM YYYY') : 'TBD'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">End Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {project.endDate ? dayjs(project.endDate).format('DD MMM YYYY') : 'TBD'}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team</h2>
        <div className="space-y-2">
          {project.leadAssignee && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">Lead</span>
              <span className="text-gray-900">{project.leadAssignee.name}</span>
            </div>
          )}
          {project.assignees && project.assignees.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.assignees.map((assignee) => (
                <span
                  key={assignee._id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {assignee.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members assigned</p>
          )}
        </div>
      </div>

      {/* Daily Updates Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Daily Updates</h2>
            <span className="text-sm text-gray-500">
              {updates.length} update{updates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="p-6">
          {updates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No updates yet</p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update._id}
                  className="border-l-4 border-sky-500 bg-gray-50 p-4 rounded-r-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {update.employee?.name || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {dayjs(update.date || update.createdAt).format('DD MMM YYYY, h:mm A')}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-medium">
                      {update.hoursLogged}h
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Work Summary</div>
                      <p className="text-gray-700">{update.summary}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Next Plan</div>
                      <p className="text-gray-700">{update.nextPlan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Milestones Section */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
          <div className="space-y-3">
            {project.milestones.map((milestone) => (
              <div key={milestone._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{milestone.name}</div>
                  <div className="text-sm text-gray-500">
                    {milestone.dueDate ? dayjs(milestone.dueDate).format('DD MMM YYYY') : 'No due date'}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    milestone.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : milestone.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
