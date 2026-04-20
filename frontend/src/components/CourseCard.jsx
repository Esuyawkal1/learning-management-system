"use client";

import { enrollCourse } from "@/services/enrollment.service";
import { useRouter } from "next/navigation";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";

export default function CourseCard({ course }) {
  const thumbnailSrc = course.thumbnailUrl || course.thumbnail || "";

  const router = useRouter();

 const handleEnroll = async () => {
  try {
    await enrollCourse(course._id);
    alert("Enrolled successfully");
     router.push("/student/courses");
  } catch (err) {
    console.error("ENROLL ERROR:", err.message);
    alert(err.message || "Enrollment failed");
  }
};

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <div style={{ position: "relative", width: "100%", height: "180px", marginBottom: "16px", overflow: "hidden", borderRadius: "12px", background: "#f1f5f9" }}>
        <CourseThumbnailPreview src={thumbnailSrc} alt={course.title} className="object-cover" />
      </div>

      <h3>{course.title}</h3>

      <p>{course.description}</p>

      <button onClick={handleEnroll}>
        Enroll
      </button>

    </div>
  );
}
