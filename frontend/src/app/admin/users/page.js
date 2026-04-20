"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "@/components/common/icons";
import Modal from "@/components/common/Modal";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserTable from "@/components/admin/users/UserTable";
import UserForm from "@/components/admin/users/UserForm";
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from "@/services/admin/user.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 7;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreateMode = !selectedUser;

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers();
      setUsers(response || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    const matchesQuery = matchesSearch([user.name, user.email, user.role], searchQuery);
    return matchesRole && matchesQuery;
  });

  const totalPages = Math.max(Math.ceil(filteredUsers.length / PAGE_SIZE), 1);
  const paginatedUsers = paginateItems(filteredUsers, currentPage, PAGE_SIZE);

  const handleSaveUser = async (formData) => {
    try {
      setIsSubmitting(true);

      if (selectedUser) {
        await updateAdminUser(selectedUser._id, formData);
        notify({
          type: "success",
          title: "User updated",
          message: "Account details were saved successfully.",
        });
      } else {
        await createAdminUser(formData);
        notify({
          type: "success",
          title: "User created",
          message: "A new account has been added successfully.",
        });
      }

      setIsUserModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to update user",
        message: requestError.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateAdminUser(user._id, {
        isActive: user.isActive === false,
      });
      notify({
        type: "success",
        title: user.isActive === false ? "User activated" : "User deactivated",
        message: `${user.name} was updated successfully.`,
      });
      await loadUsers();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to update status",
        message: requestError.message,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminUser(userToDelete._id);
      notify({
        type: "success",
        title: "User deleted",
        message: "The account has been removed successfully.",
      });
      setUserToDelete(null);
      await loadUsers();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to delete user",
        message: requestError.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage title="Users unavailable" message={error} actionLabel="Retry" onAction={loadUsers} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
            <p className="mt-1 text-sm text-slate-500">Filter by role, update access, and activate or deactivate accounts.</p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                type="search"
                placeholder="Search users..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setIsUserModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {filteredUsers.length ? (
        <>
          <UserTable
            users={paginatedUsers}
            onEdit={(user) => {
              setSelectedUser(user);
              setIsUserModalOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={setUserToDelete}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState
          title="No users match your filters"
          description="Try another search term or widen the role filter to see more accounts."
        />
      )}

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        title={isCreateMode ? "Add user" : "Update user"}
        description={
          isCreateMode
            ? "Create a new learner, instructor, or admin account directly from the dashboard."
            : "Adjust role, profile details, or account status for this user."
        }
      >
        <UserForm
          key={selectedUser?._id || "user-form"}
          initialData={selectedUser}
          mode={isCreateMode ? "create" : "edit"}
          onSubmit={handleSaveUser}
          onCancel={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Delete user"
        description={`This will permanently remove ${userToDelete?.name || "this account"}.`}
        confirmLabel="Delete User"
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
      />
    </div>
  );
}
