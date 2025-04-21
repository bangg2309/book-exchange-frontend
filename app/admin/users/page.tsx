'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { User, UserPage, Role } from '@/types/user';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react';
import UserFormModal from './components/UserFormModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([
    { name: 'ADMIN', description: 'Admin role', permissions: [] },
    { name: 'USER', description: 'User role', permissions: [] }
  ]);

  useEffect(() => {
    fetchUsers();
  }, [page, size]);

  useEffect(() => {
    // Fetch available roles when component mounts
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const roles = await userService.getRoles();
      setAvailableRoles(roles);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      // Keep using default roles defined in state
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(page, size);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId || confirm('Are you sure you want to delete this user?') === false) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again later.');
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser && selectedUser.id) {
        // Update existing user
        await userService.updateUser(selectedUser.id, userData);
      } else {
        // Create new user
        await userService.createUser(userData);
      }
      
      // Refresh user list after successful save
      fetchUsers();
    } catch (err) {
      console.error('Failed to save user:', err);
      throw err; // Let the form component handle the error
    }
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setPage(0);
    fetchUsers();
  };

  const getBadgeColor = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'USER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus size={16} className="mr-2" />
          Add User
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Roles
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id || user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{user.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role.name}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(
                                role.name
                              )}`}
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => user.id && handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            disabled={!user.id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{users.length > 0 ? page * size + 1 : 0}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * size, totalElements)}
                    </span>{' '}
                    of <span className="font-medium">{totalElements}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                      page === 0
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page + 1} of {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1 || totalPages === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                      page === totalPages - 1 || totalPages === 0
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User form modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        availableRoles={availableRoles}
      />
    </div>
  );
} 