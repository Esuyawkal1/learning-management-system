"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

export default function LessonPage() {
  const params = useParams()
  const lessonId = params?.lessonId
  const [completed, setCompleted] = useState(false)

  const completeLesson = async () => {
    await fetch(`/api/lessons/${lessonId}/complete`, {
      method: "POST"
    })

    setCompleted(true)
  }

  return (
    <div>
      <h1>Lesson</h1>

      <video controls width="600">
        <source src="/sample-video.mp4" type="video/mp4" />
      </video>

      <button onClick={completeLesson}>
        {completed ? "Completed ✓" : "Mark Complete"}
      </button>
    </div>
  )
}
