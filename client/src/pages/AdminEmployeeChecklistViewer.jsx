import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api.js';

// Predefined checklist items (same as EmployeeChecklist)
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

const AdminEmployeeChecklistViewer = () => {
  const [view, setView] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateColumns, setDateColumns] = useState([]);
  const [checklistStatus, setChecklistStatus] = useState({});

  const { data: employeesData, isLoading: loadingEmployees } = useQuery({
    queryKey: ['allEmployees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data;
    },
  });

  const { data: checklistData, isLoading: loadingChecklist } = useQuery({
    queryKey: ['employeeChecklistAdmin', selectedEmployee?._id],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      const res = await api.get(`/employees/${selectedEmployee._id}/checklist-status`);
      return res.data;
    },
    enabled: !!selectedEmployee,
  });

  useEffect(() => {
    if (checklistData?.checklistStatuses) {
      const statusMap = {};
      const dates = new Set();

      checklistData.checklistStatuses.forEach((status) => {
        const dateStr = new Date(status.date).toISOString().split('T')[0];
        statusMap[dateStr] = status.checklist || {};
        dates.add(dateStr);
      });

      setChecklistStatus(statusMap);
      const sortedDates = Array.from(dates).sort();
      setDateColumns(sortedDates);
    }
  }, [checklistData]);

  const employees = employeesData || [];

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setView('list');
    setDateColumns([]);
    setChecklistStatus({});
  };

  if (loadingEmployees) {
    return (
      <div className="max-w-full mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6">
      {view === 'list' ? (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Employee Checklist</h1>
            <p className="text-gray-600 mt-1">Select an employee to view their checklist</p>
          </div>

          {employees.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">No employees found</div>
              <p className="text-gray-400">Add employees to view their checklists</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <div
                  key={employee._id}
                  onClick={() => handleEmployeeClick(employee)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-lg">
                      {employee.name?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.roleTitle || 'Employee'}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        employee.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="mb-4 px-4 py-2 text-sky-600 hover:text-sky-700 font-medium flex items-center gap-2"
            >
              ← Back to Employee List
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedEmployee?.name}'s Checklist
            </h1>
            <p className="text-gray-600 mt-1">{selectedEmployee?.roleTitle || 'Employee'}</p>
          </div>

          {loadingChecklist ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-600">Loading checklist...</div>
            </div>
          ) : dateColumns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">No checklist data found</div>
              <p className="text-gray-400">This employee hasn't filled out any checklists yet</p>
            </div>
          ) : (
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
                                disabled
                                readOnly
                                className="w-5 h-5 text-gray-400 border-gray-300 rounded cursor-not-allowed opacity-75"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeChecklistViewer;
