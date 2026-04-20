export default function WelcomeBanner({ userName, stats }) {
  const summaryCards = [
    { label: "Enrolled Courses", value: stats?.totalEnrolledCourses || 0 },
    { label: "Completed Lessons", value: stats?.completedLessons || 0 },
    { label: "Progress", value: `${stats?.progressPercentage || 0}%` },
    { label: "Pending Assignments", value: stats?.pendingAssignments || 0 },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#0f172a,_#0f766e_65%,_#e0f2fe)] px-6 py-8 text-white shadow-2xl shadow-slate-900/10">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-100">Student Dashboard</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Welcome back, {userName || "Learner"}.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-100/85">
            Keep your enrolled courses, deadlines, activity, messages, and completion progress in one focused workspace.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-xl">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
