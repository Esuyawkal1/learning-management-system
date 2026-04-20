
"use client";
import { motion } from "framer-motion";
export default function Stats({ stats }) {
  const items = [
    { label: "Students", value: stats?.totalStudents || stats?.totalUsers || 0 },
    { label: "Published Courses", value: stats?.totalCourses || 0 },
    { label: "Enrollments", value: stats?.totalEnrollments || 0 },
  ];

 return (
  <section
    id="stats"
    className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"
  >
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className="rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-350 via-slate-450 to-slate-900 px-6 py-10 text-white shadow-2xl shadow-slate-900/15 sm:px-8 lg:px-12"
    >
      {/* Header */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-900"
      >
        Platform momentum
      </motion.p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Trusted by learners who want proof before they invest.
          </h2>

          <p className="mt-3 text-base leading-7 text-white/70">
            Real catalog data, preview-first discovery, and a clean path from browsing to full access.
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12
            }
          }
        }}
        className="mt-10 grid gap-4 sm:grid-cols-3"
      >
        {items.map((item) => (
          <motion.div
            key={item.label}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.5 }}
            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
          >
            <p className="text-4xl font-semibold">
              {item.value.toLocaleString()}
            </p>

            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-white/65">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  </section>
);
}