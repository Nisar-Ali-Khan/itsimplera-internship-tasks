export const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export const validateRegisterForm = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (confirmPassword !== undefined) {
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validatePostForm = ({ title, content }) => {
  const errors = {};
  if (!title?.trim()) errors.title = 'Title is required';
  else if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.trim().length > 150) errors.title = 'Title cannot exceed 150 characters';

  const plainText = (content || '').replace(/<[^>]*>/g, '').trim();
  if (!plainText) errors.content = 'Content is required';

  return errors;
};

export const getErrorMessage = (err) =>
  err?.response?.data?.errors?.[0] || err?.response?.data?.message || 'Something went wrong. Please try again.';
