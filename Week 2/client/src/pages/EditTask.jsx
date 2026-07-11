import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppLayout from '../components/AppLayout';
import TaskForm from '../components/TaskForm';
import Loader from '../components/Loader';
import * as taskService from '../services/taskService';
import { validateTaskForm, getErrorMessage } from '../utils/validators';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    taskService
      .getTaskById(id)
      .then(({ task }) => {
        if (!mounted) return;
        setForm({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate?.slice(0, 10) || '',
        });
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/tasks');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateTaskForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await taskService.updateTask(id, form);
      toast.success('Task updated successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <AppLayout title="Edit Task">
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Task">
      <div className="max-w-xl mx-auto">
        <h2 className="font-display font-semibold text-2xl mb-1">Edit Task</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Update the details below.</p>

        <div className="card p-6">
          <TaskForm
            form={form}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
            onCancel={() => navigate('/tasks')}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default EditTask;
