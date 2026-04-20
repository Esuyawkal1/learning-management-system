import {
  BarChart3,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from "@/components/common/icons";
import { formatCurrency, formatNumber } from "@/utils/helpers";

const getChangeText = (value) => {
  const safeValue = Number(value || 0);

  if (safeValue > 0) {
    return `Up ${safeValue}% vs last month`;
  }

  if (safeValue < 0) {
    return `Down ${Math.abs(safeValue)}% vs last month`;
  }

  return "Flat vs last month";
};

export default function AdminAnalyticsSummaryCards({ summary }) {
  const cards = [
    {
      key: "revenue",
      label: "Tracked revenue",
      value: formatCurrency(summary?.totalRevenue || 0),
      helper: getChangeText(summary?.currentMonthRevenueChange),
      accent: "from-sky-500/15 via-cyan-400/10 to-white",
      border: "border-sky-100",
      iconClassName: "text-sky-600",
      Icon: BarChart3,
    },
    {
      key: "enrollments",
      label: "Total enrollments",
      value: formatNumber(summary?.totalEnrollments || 0),
      helper: getChangeText(summary?.currentMonthEnrollmentChange),
      accent: "from-emerald-500/15 via-emerald-300/10 to-white",
      border: "border-emerald-100",
      iconClassName: "text-emerald-600",
      Icon: GraduationCap,
    },
    {
      key: "learners",
      label: "Active learners",
      value: formatNumber(summary?.activeLearners || 0),
      helper: `${formatNumber(summary?.newUsersThisMonth || 0)} new users this month`,
      accent: "from-violet-500/15 via-fuchsia-300/10 to-white",
      border: "border-violet-100",
      iconClassName: "text-violet-600",
      Icon: ShieldCheck,
    },
    {
      key: "completion",
      label: "Avg completion",
      value: `${summary?.averageCompletionRate || 0}%`,
      helper: `${formatNumber(summary?.publishedCourses || 0)} published courses`,
      accent: "from-amber-500/15 via-orange-300/10 to-white",
      border: "border-amber-100",
      iconClassName: "text-amber-600",
      Icon: BookOpen,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.Icon;

        return (
          <article
            key={card.key}
            className={`rounded-[1.75rem] border bg-gradient-to-br ${card.accent} ${card.border} p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</h2>
              </div>
              <div className={`rounded-2xl bg-white/80 p-3 ${card.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.helper}</p>
          </article>
        );
      })}
    </div>
  );
}
