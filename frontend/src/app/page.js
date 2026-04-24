export const dynamic = 'force-dynamic';
import Hero from "@/components/landing/Hero";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import Categories from "@/components/landing/Categories";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const getPublicData = async (path) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${path}`);
    }

    const payload = await response.json();
    return payload.data;
  } catch (error) {
    console.error("Landing page fetch failed:", error);
    return null;
  }
};

export default async function Home() {
  const [featuredCourses, categories, stats] = await Promise.all([
    getPublicData("/courses?limit=6"),
    getPublicData("/categories"),
    getPublicData("/stats"),
  ]);

  return (
    <div className="min-h-screen">
      <Hero totalCourses={stats?.totalCourses || featuredCourses?.length || 0} />
      <FeaturedCourses courses={featuredCourses || []} />
      <Categories categories={categories || []} />
      <Stats stats={stats || {}} />
      <CTA />
      <Footer />
    </div>
  );
}
