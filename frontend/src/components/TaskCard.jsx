
export default function TaskCard({ title, status }) {
  return (
    <article className="task-card">
      <h3>{title}</h3>
      <p>Status: {status}</p>
    </article>
  );
}
