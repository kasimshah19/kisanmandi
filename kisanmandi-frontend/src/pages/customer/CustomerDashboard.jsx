import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Package, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useDocumentTitle(`${t('nav.dashboard')} | KisanMandi`);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t('customer.welcome_back', { name: user?.name || 'Customer' })}
        </h1>
        <p className="text-green-100 text-sm sm:text-base max-w-2xl">
          {t('customer.dashboard_subtitle')}
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/products"
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-4 group-hover:bg-green-700 group-hover:text-white transition">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{t('customer.browse_produce_title')}</h3>
            <p className="text-gray-500 text-sm">{t('customer.browse_produce_desc')}</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-green-700 group-hover:translate-x-1 transition">
            {t('customer.shop_now')} <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          to="/customer/orders"
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white transition">
              <Package size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{t('customer.my_orders_title')}</h3>
            <p className="text-gray-500 text-sm">{t('customer.my_orders_desc')}</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-blue-700 group-hover:translate-x-1 transition">
            {t('customer.view_orders')} <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          to="/customer/addresses"
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-700 group-hover:text-white transition">
              <MapPin size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{t('customer.addresses_title')}</h3>
            <p className="text-gray-500 text-sm">{t('customer.addresses_desc')}</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-amber-700 group-hover:translate-x-1 transition">
            {t('customer.manage')} <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          to="/mandi"
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:bg-purple-700 group-hover:text-white transition">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{t('customer.mandi_rates_title')}</h3>
            <p className="text-gray-500 text-sm">{t('customer.mandi_rates_desc')}</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-purple-700 group-hover:translate-x-1 transition">
            {t('customer.check_rates')} <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
