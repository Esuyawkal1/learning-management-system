"use client";

import { motion } from "framer-motion";
export default function Categories({ categories = [] }) {
  const visibleCategories = categories.filter((category) => category.isActive !== false).slice(0, 8);

 

return (
  <section
    id="categories"
    className="border-y border-slate-200/70 bg-white/70 py-18"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">
          Categories
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
          Explore subjects learners keep coming back to.
        </h2>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visibleCategories.map((category, index) => (
          <motion.div
            key={category._id || category.slug || category.name}
            variants={{
              hidden: { opacity: 0, y: 25, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.45 }}
          >
            {/* CARD WRAPPER WITH GLOW */}
            <div className="group relative rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              {/* Glow layer */}
              <div className="pointer-events-none absolute -inset-[1px] rounded-[1.75rem] bg-gradient-to-r from-teal-400/0 via-teal-400/0 to-amber-400/0 opacity-0 blur-xl transition duration-300 group-hover:opacity-100 group-hover:from-teal-400/25 group-hover:via-teal-300/20 group-hover:to-amber-400/25" />

              {/* Content */}
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {category.description ||
                    "Professional learning tracks curated for modern careers."}
                </p>
              </div>

            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  </section>
);
}