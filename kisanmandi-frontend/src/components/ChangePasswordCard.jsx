import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField, Input } from './ui/FormField';
import Button from './ui/Button';
import { changePassword } from '../services/authService';

export default function ChangePasswordCard() {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t('auth.current_password_required', 'Current password is required'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('auth.password_min_length', 'Password must be at least 8 characters long'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwords_do_not_match', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success(t('auth.password_changed_success', 'Password updated successfully!'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg =
        error.friendlyMessage ||
        error.response?.data?.message ||
        t('errors.generic_retry', 'Failed to update password. Please check your current password.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shrink-0 shadow-2xs">
          <Lock size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            {t('auth.change_password_title', 'Account Security')}
          </h2>
          <p className="text-xs text-neutral-500">
            {t('auth.change_password_subtitle', 'Update your password to keep your account safe.')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg" noValidate>
        <FormField
          id="current-password"
          label={t('auth.current_password_label', 'Current Password')}
          required
        >
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-12 text-sm pr-20"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded min-h-[32px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showCurrent ? t('auth.hide_pwd', 'Hide') : t('auth.show_pwd', 'Show')}</span>
            </button>
          </div>
        </FormField>

        <FormField
          id="change-new-password"
          label={t('auth.new_password_label', 'New Password')}
          required
        >
          <div className="relative">
            <Input
              id="change-new-password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-12 text-sm pr-20"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded min-h-[32px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showNew ? t('auth.hide_pwd', 'Hide') : t('auth.show_pwd', 'Show')}</span>
            </button>
          </div>
        </FormField>

        <FormField
          id="change-confirm-password"
          label={t('auth.confirm_new_password_label', 'Confirm New Password')}
          required
        >
          <Input
            id="change-confirm-password"
            type={showNew ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-12 text-sm"
            required
          />
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            rightIcon={<ShieldCheck size={16} />}
            className="min-h-[44px] text-sm font-bold"
          >
            {isLoading
              ? t('common.loading', 'Updating...')
              : t('auth.change_password_btn', 'Change Password')}
          </Button>
        </div>
      </form>
    </div>
  );
}
