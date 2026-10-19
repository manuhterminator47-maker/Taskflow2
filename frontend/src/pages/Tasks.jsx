import { useEffect, useState } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';
import StatsBar from '../components/StatsBar';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskForm from '../components/TaskForm';
import { PAGE_SIZE } from '../constants';
import useDebounce from '../hooks/useDebounce';
import { getErrorMessage } from '../utils/apiErrors';

export default function Tasks() {
  // Server data
  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);

  // Request status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // What the user chose
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bump this to make the effects load again
  const [refreshKey, setRefreshKey] = useState(0);

  // Derived values: computed every render, never stored
  const debouncedSearch = useDebounce(search, 400);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Effect 1: categories, once
  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const { data } = await api.get('/categories/');
        if (!ignore) setCategories(data);
      } catch {
        // The form still works without categories.
      }
    }

    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  // Effect 2: statistics, whenever we reload
  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const { data } = await api.get('/tasks/stats/');
        if (!ignore) setStats(data);
      } catch {
        // Stats are a nicety; the list matters more.
      }
    }

    loadStats();
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  // Effect 3: the task list, whenever the query or the page changes
  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      try {
        const params = { page };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;

        const { data } = await api.get('/tasks/', { params });
        if (ignore) return;
        setTasks(data.results);
        setCount(data.count);
        setError('');
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err, 'Could not load tasks.'));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTasks();
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, statusFilter, page, refreshKey]);

  function reload() {
    setRefreshKey(key => key + 1);
  }

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  // Errors are thrown back to the form, which knows where to show them.
  async function handleAdd(values) {
    await api.post('/tasks/', values);
    setPage(1);
    reload();
  }

  async function handleRename(id, title) {
    await api.patch(`/tasks/${id}/`, { title });
    reload();
  }

  // Errors from these two are shown at page level.
  async function handleChangeStatus(id, status) {
    try {
      await api.patch(`/tasks/${id}/`, { status });
      setActionError('');
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update the task.'));
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/tasks/${id}/`);
      setActionError('');
      // Deleting the only item on the last page would leave us on a page that no longer exists.
      if (tasks.length === 1 && page > 1) {
        setPage(current => current - 1);
      }
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete the task.'));
    }
  }

  let content;
  if (loading) {
    content = <p className="status">Loading tasks...</p>;
  } else if (error) {
    content = <p className="error" role="alert">{error}</p>;
  } else if (tasks.length === 0) {
    content = (
      <p className="status">
        {search || statusFilter
          ? 'No tasks match your filters.'
          : 'No tasks yet. Add your first one above.'}
      </p>
    );
  } else {
    content = tasks.map(task => (
      <TaskCard
        key={task.id}
        task={task}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
        onRename={handleRename}
      />
    ));
  }

  return (
    <section>
      <h2>My tasks</h2>
      <TaskForm categories={categories} onAdd={handleAdd} />
      <StatsBar stats={stats} />
      <TaskFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={statusFilter}
        onStatusChange={handleStatusFilterChange}
      />
      {actionError && <p className="error" role="alert">{actionError}</p>}
      {content}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}