"use client";

import Modal from "@/components/common/Modal";
import CourseForm from "@/components/admin/courses/CourseForm";

export default function CourseModal({
  isOpen,
  course,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Edit Course" : "Create Course"}
      description="Maintain course catalog details and control whether each course is visible to students."
    >
      <CourseForm
        key={course?._id || "new-course"}
        initialData={course}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
