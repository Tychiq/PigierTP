'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getNonStudentUsers,
  updateUserDashboardAccess,
  updateUserFileAccessKeyword,
} from '@/lib/actions/user.actions';

interface NonStudentUser {
  $id: string;
  fullName: string;
  email: string;
  dashboardAccess: boolean;
  fileAccessKeyword?: string;
}

const USERS_PER_PAGE = 5;

const AdminDashboard = () => {
  const [nonStudentUsers, setNonStudentUsers] = useState<NonStudentUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<NonStudentUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedDocs = await getNonStudentUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedUsers: NonStudentUser[] = fetchedDocs.map((doc: any) => ({
        $id: doc.$id,
        fullName: doc.fullName,
        email: doc.email,
        dashboardAccess: doc.dashboardAccess,
        fileAccessKeyword: doc.fileAccessKeyword || '',
      }));
      setNonStudentUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    };
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    const newAccess = !currentAccess;
    await updateUserDashboardAccess(userId, newAccess);
    setFilteredUsers((prev) =>
      prev.map((user) =>
        user.$id === userId ? { ...user, dashboardAccess: newAccess } : user
      )
    );
  };

  const handleKeywordChange = async (userId: string, keyword: string) => {
    await updateUserFileAccessKeyword(userId, keyword.trim());
    setFilteredUsers((prev) =>
      prev.map((user) =>
        user.$id === userId ? { ...user, fileAccessKeyword: keyword } : user
      )
    );
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredUsers(nonStudentUsers);
    } else {
      const filtered = nonStudentUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-light-300 dark:bg-dark-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-dark-500 dark:text-light-300">
            Tableau de bord d&apos;administration
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-sm">
              <Image
                src="/assets/icons/search.svg"
                alt="Search"
                width={20}
                height={20}
                className="mr-2 opacity-70"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm text-dark-500 dark:text-light-300"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-brand hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
            >
              Rechercher
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-dark-200 shadow-md rounded-lg">
          <table className="min-w-full text-sm text-dark-500 dark:text-light-300">
            <thead className="bg-light-400 dark:bg-dark-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Nom</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Accès</th>
                <th className="px-6 py-4 text-left">Mot-clé d&apos;accès</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.$id}
                  className="border-t border-gray-200 dark:border-dark-300 hover:bg-light-400 dark:hover:bg-dark-100 transition"
                >
                  <td className="px-6 py-4 font-medium">{user.fullName}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: user.dashboardAccess ? '#22c55e' : '#ef4444',
                        color: '#fff',
                      }}
                    >
                      {user.dashboardAccess ? 'Accordé' : 'Refusé'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={user.fileAccessKeyword || ''}
                      placeholder="Ex: TGFD-RED"
                      onChange={(e) => handleKeywordChange(user.$id, e.target.value)}
                      className="border px-3 py-1 rounded-md text-sm w-40 dark:bg-dark-100 dark:border-dark-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAccess(user.$id, user.dashboardAccess)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        user.dashboardAccess
                          ? 'bg-red-600 bg-red text-white'
                          : 'bg-blue-600 bg-brand text-white'
                      }`}
                    >
                      {user.dashboardAccess ? "Révoquer l'accès" : "Accorder l'accès"}
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-light-400 dark:bg-dark-200 text-sm rounded-md disabled:opacity-50"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-light-400 dark:bg-dark-200 text-sm rounded-md disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
