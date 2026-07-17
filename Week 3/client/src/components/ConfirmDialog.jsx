import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm">
        <div className="h-10 w-10 rounded-full bg-coral-100 flex items-center justify-center mb-4">
          <AlertTriangle size={19} className="text-coral-500" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
        <p className="text-sm text-inkmuted mb-6">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
