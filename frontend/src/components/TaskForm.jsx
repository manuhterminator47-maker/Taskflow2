
import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedTitle = title.trim();

    if (!cleanedTitle) return;

    onAdd(cleanedTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="task-title">
        Task title
      </label>

      <input
        id="task-title"
        value={title}
        onChange={event => setTitle(event.target.value)}
        required
      />

      <button type="submit">Add task</button>
    </form>
  );
}
