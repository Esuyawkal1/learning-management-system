import { formatDate, getInitials } from "@/utils/helpers";

export default function RecentUsers({ users = [] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
        <p className="mt-1 text-sm text-slate-500">Newest learners, instructors, and admins.</p>
      </div>

      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <div key={user._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{user.role}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
