import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import api from '../utils/api.js';

const EmployeeProfile = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch my profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const res = await api.get('/employees/my-profile');
      return res.data;
    },
    enabled: !!user?.id,
    onSuccess: (data) => {
      setFormData({
        name: data.employee.name || '',
        contact: data.employee.contact || '',
        whatsappNumber: data.employee.whatsappNumber || '',
        telegramHandle: data.employee.telegramHandle || '',
        linkedinUrl: data.employee.linkedinUrl || '',
        githubUrl: data.employee.githubUrl || '',
        location: data.employee.location || '',
        availability: data.employee.availability || 'Full-time',
        roleTitle: data.employee.roleTitle || '',
        skills: data.employee.skills?.join(', ') || '',
      });
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates) => {
      const res = await api.put('/employees/my-profile', {
        ...updates,
        skills: updates.skills ? updates.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFormData({
        name: profileData.employee.name || '',
        contact: profileData.employee.contact || '',
        whatsappNumber: profileData.employee.whatsappNumber || '',
        telegramHandle: profileData.employee.telegramHandle || '',
        linkedinUrl: profileData.employee.linkedinUrl || '',
        githubUrl: profileData.employee.githubUrl || '',
        location: profileData.employee.location || '',
        availability: profileData.employee.availability || 'Full-time',
        roleTitle: profileData.employee.roleTitle || '',
        skills: profileData.employee.skills?.join(', ') || '',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">Loading profile...</div>
      </div>
    );
  }

  const employee = profileData?.employee;
  const userData = profileData?.user;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        {/* Personal Information */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{employee?.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900 py-2">{userData?.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone/Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{employee?.contact || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{employee?.location || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role/Title</label>
              {isEditing ? (
                <input
                  type="text"
                  name="roleTitle"
                  value={formData.roleTitle}
                  onChange={handleChange}
                  placeholder="e.g., Senior Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{employee?.roleTitle || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              {isEditing ? (
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              ) : (
                <p className="text-gray-900 py-2">{employee?.availability || 'N/A'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
              {isEditing ? (
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="flex flex-wrap gap-2 py-2">
                  {employee?.skills && employee.skills.length > 0 ? (
                    employee.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Social Media */}
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact & Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {employee?.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${employee.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      {employee.whatsappNumber}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Handle</label>
              {isEditing ? (
                <input
                  type="text"
                  name="telegramHandle"
                  value={formData.telegramHandle}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {employee?.telegramHandle ? (
                    <a
                      href={`https://t.me/${employee.telegramHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      @{employee.telegramHandle.replace('@', '')}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              {isEditing ? (
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {employee?.linkedinUrl ? (
                    <a
                      href={employee.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
              {isEditing ? (
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {employee?.githubUrl ? (
                    <a
                      href={employee.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="p-4 md:p-6 bg-gray-50 rounded-b-lg flex gap-3">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Account Information (Read-only) */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Employee ID</label>
            <p className="text-gray-900 mt-1 font-mono text-sm">{employee?._id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${employee?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {employee?.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User Role</label>
            <p className="text-gray-900 mt-1">{userData?.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Joined Date</label>
            <p className="text-gray-900 mt-1">{new Date(employee?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
