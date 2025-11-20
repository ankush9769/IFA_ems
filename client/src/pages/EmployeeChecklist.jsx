import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';
import { useAuthStore } from '../stores/authStore.js';

// Predefined checklist items
const CHECKLIST_ITEMS = [
  { id: 1, text: "Attended morning session" },
  { id: 2, text: "Came on time" },
  { id: 3, text: "Worked on my project" },
  { id: 4, text: "Asked senior team for new Project" },
  { id: 5, text: "Got code corrected" },
  { id: 6, text: "Updated client" },
  { id: 7, text: "Worked on training task" },
  { id: 8, text: "Updated Senior Team" },
  { id: 9, text: "Updated Daily Progress" },
  { id: 10, text: "Plan Next day's task" },
  { id: 11, text: "Completed all task for the day" },
  { id: 12, text: "Worked on more than 1 project (if assigned)" },
  { id: 13, text: "Tasks for the day" },
  { id: 14, text: "Did you inform you are not able to do the project ?" },
  { id: 15, text: "Did you made sure project was given to someone else ?" },
  { id: 16, text: "Did you made sure project was on time ?" },
  { id: 17, text: "Did you inform before bunking the day before ?" },
  { id: 18, text: "Did you inform before coming late ?" },
  { id: 19, text: "Did you inform when you left the meeting ?" },
  { id: 20, text: "Is freelancer needed for this project ?" },
  { id: 21, text: "Did you made sure freelancer was hired ?" },
  { id: 22, text: "Did you made sure you have been added to client's WhatsApp" },
  { id: 23, text: "Has the slack group made for this project ?" },
  { id: 24, text: "Check if it has been assigned to somebody else already ?" },
  { id: 25, text: "Choose your own supervisor" },
  { id: 26, text: "Check if the project assigned is still on and in priority" },
  { id: 27, text: "Have you taken follow up from the client?" },
  { id: 28, text: "Have you made all the tasks for the project?" },
  { id: 29, text: "Did you assign deadlines for each task?" },
  { id: 30, text: "Did you record all the relavent loom videos" },
  { id: 31, text: "Did you record organize loom videos" },
  { id: 32, text: "Was deadline followed?" },
  { id: 33, text: "Were you screensharing and working at all times?" },
  { id: 34, text: "No. of hours attended today" }
];

const EmployeeChecklist = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [dateColumns, setDateColumns] = useState([]);
  const [checklistStatus, setChecklistStatus] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [savingCell, setSavingCell] = useState(null);

  // Fetch checklist status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['employeeChecklistStatus'],
    queryFn: async () => {
      const res = await api.get('/employees/checklist-status');
      return res.data;
    },
  });

  // Transform status data into map structure
  useEffect(() => {
    if (statusData?.checklistStatuses) {
      const statusMap = {};
      const dates = new Set();

      statusData.checklistStatuses.forEach((status) => {
        const dateStr = new Date(status.date).toISOString().split('T')[0];
        statusMap[dateStr] = status.checklist || {};
        dates.add(dateStr);
      });

      setChecklistStatus(statusMap);
      
      // Sort dates chronologically
      const sortedDates = Array.from(dates).sort();
      setDateColumns(sortedDates);
    }
  }, [statusData]);

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
    
    // Initialize empty checklist for this date
    setChecklistStatus((prev) => ({
      ...prev,
      [newDate]: {}
    }));
    
    // Close modal and reset
    setShowDatePicker(false);
    setNewDate('');
    setDateError('');

    // Scroll to the new column
    setTimeout(() => {
      const table = document.querySelector('.overflow-x-auto');
      if (table) {
        table.scrollLeft = table.scrollWidth;
      }
    }, 100);
  }, [newDate, dateColumns]);

  // Save checklist status mutation
  const saveChecklistMutation = useMutation({
    mutationFn: async ({ date, checklist }) => {
      const res = await api.post('/employees/checklist-status', {
        date,
        checklist,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeChecklistStatus'] });
      setSavingCell(null);
    },
    onError: (error) => {
      alert('Failed to save checklist: ' + (error.response?.data?.message || error.message));
      setSavingCell(null);
    },
  });

  // Handle checkbox toggle
  const handleCheckboxToggle = useCallback((itemId, date) => {
    // Optimistic update
    setChecklistStatus((prev) => {
      const currentStatus = prev[date] || {};
      const newStatus = {
        ...currentStatus,
        [itemId.toString()]: !currentStatus[itemId.toString()]
      };
      
      // Save to backend
      setSavingCell({ itemId, date });
      saveChecklistMutation.mutate({
        date,
        checklist: newStatus
      });

      return {
        ...prev,
        [date]: newStatus
      };
    });
  }, [saveChecklistMutation]);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading checklist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Checklist</h1>
          <p className="text-gray-600 mt-1">Track your daily tasks and responsibilities</p>
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
                <th className="sticky left-0 z-10 bg-gray-100 border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 min-w-[400px]">
                  Checklist Item
                </th>
                {dateColumns.map((date) => (
                  <th
                    key={date}
                    className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 min-w-[120px]"
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
              {CHECKLIST_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white border border-gray-300 px-4 py-3 text-gray-900">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-500 min-w-[24px]">{item.id}</span>
                      <span>{item.text}</span>
                    </div>
                  </td>
                  {dateColumns.map((date) => {
                    const isChecked = checklistStatus[date]?.[item.id.toString()] || false;
                    return (
                      <td
                        key={`${item.id}-${date}`}
                        className="border border-gray-300 px-4 py-3 text-center align-middle"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(item.id, date)}
                          className="w-5 h-5 text-sky-500 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
                        />
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

export default EmployeeChecklist;
