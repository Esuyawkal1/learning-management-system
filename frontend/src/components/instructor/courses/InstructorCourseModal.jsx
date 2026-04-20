"use client";

import Modal from "@/components/common/Modal";
import InstructorCourseForm from "@/components/instructor/courses/InstructorCourseForm";

export default function InstructorCourseModal({ isOpen, course, onClose, onSubmit, isSubmitting }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? "Edit Course" : "Create Course"} description="Manage your own course catalog while admins keep control of publish visibility.">
      <InstructorCourseForm key={course?._id || "new-instructor-course"} course={course} onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
    </Modal>
  );
}
