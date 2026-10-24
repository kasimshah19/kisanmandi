import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, Edit2, Star, Check, Phone } from 'lucide-react';
import { addressService } from '../../services/addressService';
import AddressForm from '../../components/AddressForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function Addresses() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('addresses.title')} | KisanMandi`);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await addressService.getAll();
      setAddresses(res.data || []);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || t('errors.generic_retry');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingId) {
        await addressService.update(editingId, data);
        toast.success(t('addresses.saved_success'));
      } else {
        await addressService.create(data);
        toast.success(t('addresses.saved_success'));
      }
      setShowForm(false);
      setEditingId(null);
      loadAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic_retry'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await addressService.remove(deleteId);
      toast.success(t('addresses.deleted_success'));
      loadAddresses();
    } catch {
      toast.error(t('errors.generic_retry'));
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      toast.success(t('addresses.saved_success'));
      loadAddresses();
    } catch {
      toast.error(t('errors.generic_retry'));
    }
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const editAddressData = editingId ? addresses.find((a) => a.id === editingId) : null;

  return (
    <div className="min-h-screen bg-[#fafaf7] py-6 sm:py-8 lg:py-10">
      <div className="page-container max-w-5xl space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: t('nav.home'), to: '/' },
            { label: t('addresses.title') }
          ]}
          title={t('addresses.title')}
          subtitle={t('customer.addresses_desc')}
          actions={
            !showForm && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(true)}
                className="text-xs font-bold"
              >
                <Plus size={15} className="mr-1" />
                {t('addresses.add_address')}
              </Button>
            )
          }
        />

        {showForm && (
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm max-w-2xl">
            <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
              {editingId ? t('addresses.edit_address') : t('addresses.add_new_address')}
            </h2>
            <AddressForm
              initial={editAddressData}
              onSubmit={handleSave}
              onCancel={cancelEdit}
              loading={saving}
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto py-8">
            <ErrorState title={t('addresses.title')} message={error} onRetry={loadAddresses} />
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <MapPin size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {t('addresses.no_addresses')}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {t('addresses.no_addresses_desc')}
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-1.5" />
              {t('addresses.add_address')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between relative hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-neutral-900 text-base">{addr.fullName}</h3>
                      {addr.defaultAddress && (
                        <Badge variant="brand" size="sm">
                          <Star size={11} className="mr-1 fill-current" />
                          {t('addresses.default')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 mb-2.5">
                    <Phone size={12} className="text-neutral-400" />
                    {addr.phone}
                  </p>

                  <div className="text-xs sm:text-sm text-neutral-700 space-y-0.5 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-200/60">
                    <p>{addr.line1}</p>
                    <p>
                      {addr.city}, {addr.state} -{' '}
                      <span className="font-bold text-neutral-900">{addr.pincode}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(addr)}
                      className="text-neutral-700 hover:text-brand-800 font-bold p-1.5 rounded-lg hover:bg-neutral-100 transition flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => setDeleteId(addr.id)}
                      className="text-neutral-400 hover:text-red-600 font-bold p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      {t('common.delete')}
                    </button>
                  </div>

                  {!addr.defaultAddress && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-brand-700 hover:text-brand-900 font-bold hover:underline"
                    >
                      {t('addresses.set_as_default')}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* + Add Address Card in Grid */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-3xl border-2 border-dashed border-neutral-300 hover:border-brand-500 hover:bg-brand-50/20 p-6 flex flex-col items-center justify-center text-center transition group min-h-[190px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-brand-100 text-neutral-500 group-hover:text-brand-700 flex items-center justify-center transition mb-3">
                  <Plus size={22} />
                </div>
                <span className="font-bold text-sm text-neutral-800 group-hover:text-brand-800">
                  {t('addresses.add_new_address')}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">
                  Save another delivery location
                </span>
              </button>
            )}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!deleteId}
          title={t('addresses.delete_title')}
          message={t('addresses.delete_confirm')}
          confirmText={t('common.delete')}
          confirmStyle="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
}
