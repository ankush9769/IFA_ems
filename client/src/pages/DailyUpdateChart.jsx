import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';
import { useAuthStore } from '../stores/authStore.js';

const DailyUpdateChart = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [dateColumns, setDateColumns] = useState([]);
  const [updates, setUpdates] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [savingCell, setSavingCell] = useState(null);

  // Fetch assigned projects
  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['myAssignedProjects'],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { assigned: true } });
      return res.data;
    },
  });

  // Fetch all daily updates for the employee
  const { data: updatesData, isLoading: loadingUpdates } = useQuery({
    queryKey: ['employeeDailyUpdates'],
    queryFn: async () => {
      const res = await api.get('/employees/daily-updates');
      return res.data;
    },
  });

  const projects = projectsData?.projects || [];
  const isLoading = loadingProjects || loadingUpdates;

  // Add date column handler
  const handleAddDateColumn = useCallback(() => {
    if (!newDate) {
      setDateError('Please select a date');
      return;
    }

    // Check for duplicate
    if (dateColumns.includes(newDate)) {
      setDateError('This date column already exists');
      return;
    }

    // Add date and sort chronologically
    const updatedDates = [...dateColumns, newDate].sort();
    setDateColumns(updatedDates);
    
    // Close modal and reset
    setShowDatePicker(false);
    setNewDate('');
    setDateError('');

    // Scroll to the new column (optional enhancement)
    setTimeout(() => {
      const table = document.querySelector('.overflow-x-auto');
      if (table) {
        table.scrollLeft = table.scrollWidth;
      }
    }, 100);
  }, [newDate, dateColumns]);

  // Save update mutation
  const saveUpdateMutation = useMutation({
    mutationFn: async ({ projectId, date, summary, updateId }) => {
      if (updateId) {
        // Update existing
        const res = await api.put(`/projects/${projectId}/updates/${updateId}`, {
          summary,
          date,
        });
        return res.data;
      } else {
        // Create new
        const res = await api.post(`/projects/${projectId}/updates`, {
          summary,
          date,
          employee: user?.employeeRef,
          nextPlan: '',
          hoursLogged: 0,
        });
        return res.data;
      }
    },
    onSuccess: (data, variables) => {
      // Update local state
      setUpdates((prev) => ({
        ...prev,
        [variables.projectId]: {
          ...prev[variables.projectId],
          [variables.date]: data,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ['employeeDailyUpdates'] });
      setSavingCell(null);
    },
    onError: (error) => {
      alert('Failed to save update: ' + (error.response?.data?.message || error.message));
      setSavingCell(null);
    },
  });

  // Handle cell click to start editing
  const handleCellClick = useCallback((projectId, date) => {
    const cellUpdate = updates[projectId]?.[date];
    setEditingCell({ projectId, date });
    setEditValue(cellUpdate?.summary || '');
  }, [updates]);

  // Handle save cell
  const handleSaveCell = useCallback((projectId, date) => {
    if (!editValue.trim()) {
      setEditingCell(null);
      return;
    }

    const cellUpdate = updates[projectId]?.[date];
    setSavingCell({ projectId, date });
    
    saveUpdateMutation.mutate({
      projectId,
      date,
      summary: editValue,
      updateId: cellUpdate?._id,
    });

    setEditingCell(null);
  }, [editValue, updates, saveUpdateMutation]);

  // Handle cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Transform updates data into a map structure
  useEffect(() => {
    if (updatesData?.updates) {
      const updatesMap = {};
      const dates = new Set();

      updatesData.updates.forEach((update) => {
        const projectId = update.project._id;
        const dateStr = new Date(update.date).toISOString().split('T')[0];
        
        if (!updatesMap[projectId]) {
          updatesMap[projectId] = {};
        }
        updatesMap[projectId][dateStr] = update;
        dates.add(dateStr);
      });

      setUpdates(updatesMap);
      
      // Sort dates chronologically
      const sortedDates = Array.from(dates).sort();
      setDateColumns(sortedDates);
    }
  }, [updatesData]);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading daily update chart...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-full mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Update Chart</h1>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 text-lg mb-4">No projects assigned yet</div>
          <p className="text-gray-400">Contact your admin to get assigned to projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Update Chart</h1>
          <p className="text-gray-600 mt-1">Track your daily updates across all projects</p>
        </div>
        <button
          onClick={() => setShowDatePicker(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
        >
          + Add Date Column
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="sticky left-0 z-10 bg-gray-100 border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 min-w-[250px]">
                  Project
                </th>
                {dateColumns.map((date) => (
                  <th
                    key={date}
                    className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 min-w-[200px]"
                  >
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </th>
                ))}
                {dateColumns.length === 0 && (
                  <th className="border border-gray-300 px-4 py-3 text-center text-gray-500 italic">
                    No date columns yet - click "Add Date Column" to start
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white border border-gray-300 px-4 py-3 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold">{project.clientName}</span>
                      <span className="text-sm text-gray-600 mt-1">
                        {project.projectDescription?.substring(0, 50)}
                        {project.projectDescription?.length > 50 ? '...' : ''}
                      </span>
                      <span className={`text-xs mt-1 inline-block px-2 py-1 rounded w-fit ${
                        project.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : project.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </td>
                  {dateColumns.map((date) => {
                    const cellUpdate = updates[project._id]?.[date];
                    const isEditing = editingCell?.projectId === project._id && editingCell?.date === date;
                    const isSaving = savingCell?.projectId === project._id && savingCell?.date === date;
                    
                    return (
                      <td
                        key={`${project._id}-${date}`}
                        className={`border border-gray-300 px-4 py-3 align-top min-h-[80px] transition-colors ${
                          isEditing ? 'bg-sky-50 border-sky-500 border-2' : 'cursor-pointer hover:bg-gray-100'
                        }`}
                        onClick={() => !isEditing && handleCellClick(project._id, date)}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(project._id, date)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  handleCancelEdit();
                                } else if (e.key === 'Enter' && e.ctrlKey) {
                                  handleSaveCell(project._id, date);
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                              rows={3}
                              placeholder="Enter daily update..."
                            />
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveCell(project._id, date);
                                }}
                                className="px-2 py-1 bg-sky-500 text-white rounded hover:bg-sky-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              <span className="text-gray-500 ml-auto self-center">Ctrl+Enter to save</span>
                            </div>
                          </div>
                        ) : isSaving ? (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </div>
                        ) : cellUpdate ? (
                          <div className="text-sm text-gray-700">
                            {cellUpdate.summary}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            Click to add update
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {dateColumns.length === 0 && (
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-400">
                      -
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Date Column</h3>
            <input
              type="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setDateError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent mb-2"
            />
            {dateError && (
              <p className="text-red-500 text-sm mb-4">{dateError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setNewDate('');
                  setDateError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDateColumn}
                className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyUpdateChart;
