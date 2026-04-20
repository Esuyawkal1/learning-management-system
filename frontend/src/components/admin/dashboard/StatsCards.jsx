import { BookOpen, BookOpenCheck, GraduationCap, Users } from "@/components/common/icons";
import { formatNumber } from "@/utils/helpers";

const cardConfig = [
  {
    key: "users",
    label: "Total Users",
    icon: Users,
    accent: "from-sky-500/15 to-sky-100",
    iconClassName: "text-sky-600",
  },
  {
    key: "courses",
    label: "Total Courses",
    icon: BookOpen,
    accent: "from-emerald-500/15 to-emerald-100",
    iconClassName: "text-emerald-600",
  },
  {
    key: "lessons",
    label: "Total Lessons",
    icon: BookOpenCheck,
    accent: "from-amber-500/15 to-amber-100",
    iconClassName: "text-amber-600",
  },
  {
    key: "enrollments",
    label: "Total Enrollments",
    icon: GraduationCap,
    accent: "from-violet-500/15 to-violet-100",
    iconClassName: "text-violet-600",
  },
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${card.accent} p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                  {formatNumber(stats?.[card.key] || 0)}
                </h3>
              </div>
              <div className={`rounded-2xl bg-white/80 p-3 ${card.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
