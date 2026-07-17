import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, BookOpen, PenLine, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import { validateRegisterForm, getErrorMessage } from '../utils/validators';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'reader' });
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
      toast.success('Account created! Welcome to Chronicle.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-forest-500 flex items-center justify-center">
            <BookOpen size={18} className="text-gold-400" />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">Chronicle</span>
        </div>

        <div className="card p-7">
          <h1 className="font-display font-semibold text-xl mb-1.5">Create your account</h1>
          <p className="text-sm text-inkmuted mb-6">Join as a reader, or write your own posts as an author.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label-text">I want to join as</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'reader' })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-colors ${
                    form.role === 'reader' ? 'border-forest-500 bg-forest-50 text-forest-500' : 'border-ink/15 text-inkmuted hover:bg-paper'
                  }`}
                >
                  <BookMarked size={18} />
                  <span className="text-xs font-medium">Reader</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'author' })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-colors ${
                    form.role === 'author' ? 'border-forest-500 bg-forest-50 text-forest-500' : 'border-ink/15 text-inkmuted hover:bg-paper'
                  }`}
                >
                  <PenLine size={18} />
                  <span className="text-xs font-medium">Author</span>
                </button>
              </div>
            </div>

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inkmuted hover:text-ink"
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

        <p className="text-center text-sm text-inkmuted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-500 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
