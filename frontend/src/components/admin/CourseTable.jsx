"use client";

export default function CourseTable({ courses }) {
  return (
    <table className="w-full bg-white rounded shadow">

      <thead>
        <tr>
          <th>Title</th>
          <th>Instructor</th>
          <th>Students</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {courses.map((course) => (
          <tr key={course._id}>

            <td>{course.title}</td>

            <td>{course.instructor?.name}</td>

            <td>{course.studentsCount}</td>

            <td>
              Edit | Delete
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  );
}