import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import { validateRegisterForm, getErrorMessage } from '../utils/validators';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      await registerUser(payload);
      toast.success('Account created! Welcome to Ledger.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <CheckSquare size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">Ledger</span>
        </div>

        <div className="card p-7">
          <h1 className="font-display font-semibold text-xl mb-1.5">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start organizing your work in minutes.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Full name" htmlFor="name" error={errors.name}>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password}>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input-field pr-10"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="input-field"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </FormField>

            <button type="submit" className="btn-primary w-full mt-2" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
