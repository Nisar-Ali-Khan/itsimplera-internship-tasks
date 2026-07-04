import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppLayout from '../components/AppLayout';
import TaskForm from '../components/TaskForm';
import * as taskService from '../services/taskService';
import { validateTaskForm, getErrorMessage } from '../utils/validators';

const initialForm = { title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' };

const CreateTask = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      await taskService.createTask(form);
      toast.success('Task created successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Task">
      <div className="max-w-xl mx-auto">
        <h2 className="font-display font-semibold text-2xl mb-1">New Task</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Add a task to your list.</p>

        <div className="card p-6">
          <TaskForm
            form={form}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Create Task"
            onCancel={() => navigate('/tasks')}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateTask;
