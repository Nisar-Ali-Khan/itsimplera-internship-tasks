import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyRound, UserRound, Camera } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/validators';
import { resolveMediaUrl } from '../utils/media';

const Profile = () => {
  const { user, updateUserInState } = useAuth();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { user: updated } = await userService.uploadAvatar(file);
      updateUserInState(updated);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    else if (profileForm.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (profileForm.bio.length > 280) errors.bio = 'Bio cannot exceed 280 characters';

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setSavingProfile(true);
    try {
      const { user: updated } = await userService.updateProfile(profileForm);
      updateUserInState(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!pwForm.newPassword) errors.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (pwForm.confirmNewPassword !== pwForm.newPassword) errors.confirmNewPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setSavingPw(true);
    try {
      await userService.changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="card p-6 flex items-center gap-4">
          <button onClick={handleAvatarClick} className="relative group shrink-0" disabled={uploadingAvatar}>
            {user?.profilePicUrl ? (
              <img src={resolveMediaUrl(user.profilePicUrl)} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor || '#1B4332' }}
              >
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </button>
          <div>
            <h2 className="font-display font-semibold text-xl">{user?.name}</h2>
            <p className="text-sm text-inkmuted">{user?.email}</p>
            <span className="tag-pill mt-1.5 capitalize">{user?.role}</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserRound size={17} className="text-forest-500" />
            <h3 className="font-display font-semibold">Profile Details</h3>
          </div>
          <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
            <FormField label="Full name" htmlFor="name" error={profileErrors.name}>
              <input
                id="name"
                className="input-field"
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, name: e.target.value });
                  if (profileErrors.name) setProfileErrors({ ...profileErrors, name: undefined });
                }}
              />
            </FormField>
            <FormField label="Bio" htmlFor="bio" error={profileErrors.bio}>
              <textarea
                id="bio"
                rows={3}
                className="input-field resize-none"
                placeholder="A short bio about yourself…"
                value={profileForm.bio}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, bio: e.target.value });
                  if (profileErrors.bio) setProfileErrors({ ...profileErrors, bio: undefined });
                }}
              />
            </FormField>
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={17} className="text-forest-500" />
            <h3 className="font-display font-semibold">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <FormField label="Current password" htmlFor="currentPassword" error={pwErrors.currentPassword}>
              <input
                id="currentPassword"
                type="password"
                className="input-field"
                value={pwForm.currentPassword}
                onChange={(e) => {
                  setPwForm({ ...pwForm, currentPassword: e.target.value });
                  if (pwErrors.currentPassword) setPwErrors({ ...pwErrors, currentPassword: undefined });
                }}
              />
            </FormField>
            <FormField label="New password" htmlFor="newPassword" error={pwErrors.newPassword}>
              <input
                id="newPassword"
                type="password"
                className="input-field"
                value={pwForm.newPassword}
                onChange={(e) => {
                  setPwForm({ ...pwForm, newPassword: e.target.value });
                  if (pwErrors.newPassword) setPwErrors({ ...pwErrors, newPassword: undefined });
                }}
              />
            </FormField>
            <FormField label="Confirm new password" htmlFor="confirmNewPassword" error={pwErrors.confirmNewPassword}>
              <input
                id="confirmNewPassword"
                type="password"
                className="input-field"
                value={pwForm.confirmNewPassword}
                onChange={(e) => {
                  setPwForm({ ...pwForm, confirmNewPassword: e.target.value });
                  if (pwErrors.confirmNewPassword) setPwErrors({ ...pwErrors, confirmNewPassword: undefined });
                }}
              />
            </FormField>
            <button type="submit" className="btn-primary" disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
