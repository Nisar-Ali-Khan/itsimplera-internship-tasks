import FormField from './FormField';

const TaskForm = ({ form, errors, onChange, onSubmit, submitting, submitLabel, onCancel }) => (
  <form onSubmit={onSubmit} noValidate className="space-y-5">
    <FormField label="Title" htmlFor="title" error={errors.title}>
      <input
        id="title"
        name="title"
        type="text"
        className="input-field"
        placeholder="e.g. Prepare client presentation"
        value={form.title}
        onChange={onChange}
      />
    </FormField>

    <FormField label="Description" htmlFor="description" error={errors.description}>
      <textarea
        id="description"
        name="description"
        rows={4}
        className="input-field resize-none"
        placeholder="Add any relevant details…"
        value={form.description}
        onChange={onChange}
      />
    </FormField>

    <div className="grid grid-cols-2 gap-4">
      <FormField label="Priority" htmlFor="priority">
        <select id="priority" name="priority" className="input-field" value={form.priority} onChange={onChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </FormField>

      <FormField label="Status" htmlFor="status">
        <select id="status" name="status" className="input-field" value={form.status} onChange={onChange}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </FormField>
    </div>

    <FormField label="Due Date" htmlFor="dueDate" error={errors.dueDate}>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        className="input-field"
        value={form.dueDate}
        onChange={onChange}
      />
    </FormField>

    <div className="flex gap-3 pt-2">
      <button type="submit" className="btn-primary flex-1" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
      <button type="button" className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>
    </div>
  </form>
);

export default TaskForm;
