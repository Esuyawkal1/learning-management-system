"use client";

import Table from "@/components/common/Table";
import UserActions from "@/components/admin/users/UserActions";
import { formatDate, getInitials } from "@/utils/helpers";

export default function UserTable({ users, onEdit, onToggleStatus, onDelete }) {
  return (
    <Table columns={["User", "Role", "Status", "Joined", "Updated", "Actions"]}>
      {users.map((user) => {
        const isActive = user.isActive !== false;

        return (
          <tr key={user._id} className="text-sm text-slate-600">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-4 uppercase tracking-[0.2em] text-slate-500">{user.role}</td>
            <td className="px-5 py-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="px-5 py-4">{formatDate(user.createdAt)}</td>
            <td className="px-5 py-4">{formatDate(user.updatedAt)}</td>
            <td className="px-5 py-4">
              <UserActions
                isActive={isActive}
                onEdit={() => onEdit(user)}
                onToggleStatus={() => onToggleStatus(user)}
                onDelete={() => onDelete(user)}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
