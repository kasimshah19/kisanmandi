import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Shield, KeyRound, LogOut, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/PageHeader';
import { FormField, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import DashboardLayout from '../../components/DashboardLayout';
import PasswordPolicyChecklist, { checkPasswordRules } from '../../components/PasswordPolicyChecklist';

function SecurityContent() {
  const { t } = useTranslation();
  const { user, changePassword, logoutAll } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const [lockoutMinutes, setLockoutMinutes] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLockoutMinutes(null);
  };

  const getStrengthLabel = (pwd) => {
    if (!pwd) return { label: '', color: '' };
    const rules = checkPasswordRules(pwd, user?.email);
    if (rules.passedCount <= 2) {
      return { label: t('auth.strength_weak', 'Weak'), color: 'text-rose-600 bg-rose-50' };
    }
    if (rules.passedCount <= 4) {
      return { label: t('auth.strength_fair', 'Fair'), color: 'text-amber-700 bg-amber-50' };
    }
    return { label: t('auth.strength_strong', 'Strong'), color: 'text-emerald-700 bg-emerald-50' };
  };

  const strength = getStrengthLabel(form.newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) {
      toast.error(t('auth.current_password_required', 'Current password is required'));
      return;
    }

    const rules = checkPasswordRules(form.newPassword, user?.email);
    if (!rules.allPassed) {
      toast.error(t('auth.password_requirements_failed', 'Please fulfill all password requirements'));
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('auth.password_mismatch', 'Passwords do not match'));
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error(t('auth.password_same_as_current', 'New password cannot be the same as your current password'));
      return;
    }

    setIsSubmitting(true);
    setLockoutMinutes(null);

    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success(t('auth.password_changed_success', 'Password updated successfully!'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 429) {
        const secs = data?.retryAfterSeconds || 900;
        const mins = Math.max(1, Math.ceil(secs / 60));
        setLockoutMinutes(mins);
        toast.error(t('auth.lockout_message', 'Too many wrong tries. Please try again after {{minutes}} minutes.', { minutes: mins }));
      } else {
        const msg = data?.message || err.message || t('errors.generic', 'Failed to update password');
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success(t('auth.logout_all_success', 'Logged out from all devices.'));
      navigate('/login', { replace: true });
    } catch {
      toast.error(t('errors.generic', 'Failed to log out from all devices'));
    } finally {
      setIsLoggingOutAll(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title={t('account.security_title', 'Account Security')}
        description={t('account.security_desc', 'Manage your login credentials, active sessions, and account protection.')}
        icon={Shield}
      />

      {/* Lockout Warning Banner */}
      {lockoutMinutes && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <Lock className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">{t('auth.lockout_title', 'Security Lockout Active')}</p>
            <p>
              {t('auth.lockout_message', 'Too many wrong tries. Please try again after {{minutes}} minutes.', { minutes: lockoutMinutes })}
            </p>
          </div>
        </div>
      )}

      {/* Change Password Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">{t('account.change_password', 'Change Password')}</h2>
            <p className="text-xs text-stone-500">
              {t('account.change_password_subtitle', 'Choose a strong password to safeguard your account.')}
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {/* Current Password */}
          <FormField label={t('account.current_password', 'Current Password')} required>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          {/* New Password */}
          <FormField label={t('account.new_password', 'New Password')} required>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          {/* Password Policy Live Checklist & Strength */}
          {form.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">{t('auth.strength', 'Strength')}:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <PasswordPolicyChecklist password={form.newPassword} email={user?.email} />
            </div>
          )}

          {/* Confirm New Password */}
          <FormField label={t('account.confirm_new_password', 'Confirm New Password')} required>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{t('auth.password_mismatch', 'Passwords do not match')}</p>
            )}
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={isSubmitting || !!lockoutMinutes}
            >
              {t('account.update_password', 'Update Password')}
            </Button>
          </div>
        </form>
      </section>

      {/* Logout Everywhere Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">{t('account.session_management', 'Active Sessions')}</h2>
            <p className="text-xs text-stone-500">
              {t('account.session_management_desc', 'Revoke access across all other browsers, mobile devices, and computers.')}
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">
          {t(
            'account.logout_all_warning',
            'If you suspect unauthorized access or lost a device, you can instantly terminate all active sessions. You will be signed out everywhere and will need to log in again.'
          )}
        </p>

        <div>
          <Button
            type="button"
            variant="outline"
            className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('account.logout_all_devices', 'Log out from all devices')}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title={t('account.logout_all_confirm_title', 'Log out from all devices?')}
        message={t(
          'account.logout_all_confirm_msg',
          'This will revoke all active refresh tokens and sessions on all devices. You will be redirected to the login page.'
        )}
        confirmText={t('account.logout_all_btn', 'Log out everywhere')}
        confirmStyle="danger"
        onConfirm={handleConfirmLogoutAll}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}

export default function Security() {
  const { user } = useAuth();
  useDocumentTitle('Account Security | KisanMandi');

  const isFarmerOrAdmin = user?.role === 'FARMER' || user?.role === 'ADMIN';

  if (isFarmerOrAdmin) {
    return (
      <DashboardLayout role={user.role}>
        <div className="p-4 sm:p-6 lg:p-8">
          <SecurityContent />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SecurityContent />
    </div>
  );
}
