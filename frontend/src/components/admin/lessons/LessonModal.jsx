"use client";

import Modal from "@/components/common/Modal";
import LessonForm from "@/components/admin/lessons/LessonForm";

export default function LessonModal({
  isOpen,
  lesson,
  courses,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? "Edit Lesson" : "Create Lesson"}
      description="Create lessons, update content, and reassign them across courses."
    >
      <LessonForm
        key={lesson?._id || "new-lesson"}
        initialData={lesson}
        courses={courses}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
