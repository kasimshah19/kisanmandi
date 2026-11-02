import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export const COMMON_PASSWORD_LIST = [
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password12', 'password123',
  'password1234', 'qwerty123', 'qwertyuiop', 'letmein123', 'welcome1', 'welcome12', 'welcome123',
  'admin123', 'admin1234', 'iloveyou1', 'sunshine1', 'princess1', 'football1', 'monkey123',
  'shadow123', 'dragon123', 'master123', 'freedom123', 'trustno1', 'computer1', 'superman1',
  'charlie1', 'secret123', 'killer123', 'starwars1', 'system123', 'server123', 'root1234',
  'pass1234', 'india123', 'kisan123', 'mandi123', 'farmer123', 'customer1', 'passcode1',
  'changeme1', 'default123', 'testing123', 'tester123', 'sample123', 'temp1234', 'user1234',
  'guest123', 'welcome01', 'password01', 'p@ssword1', 'p@ssw0rd1', 'hunter21', 'baseball1',
  'soccer123', 'hockey123', 'basketball1', 'cheese123', 'orange123', 'purple123', 'yellow123',
  'coffee123', 'pepper123', 'ginger123', 'buster123', 'harley123', 'bailey123', 'magical1',
  'cookie123', 'button123', 'peanut123', 'tiger123', 'cowboy123', 'freedom1', 'hannah123',
  'summer123', 'winter123', 'spring123', 'autumn123', 'london123', 'matrix123', 'diamond1',
  'silver123', 'golden123', 'jordan123', 'jackson1', 'michael1', 'thomas123', 'robert123',
  'william1', 'daniel123', 'matthew1', 'anthony1', 'donald123', 'stephen1', 'andrew123',
  'kisanmandi1', 'kisanmandi123'
];

export function checkPasswordRules(password = '', email = '') {
  const pwd = password || '';
  const em = (email || '').toLowerCase().trim();

  const minLength = pwd.length >= 8 && pwd.length <= 72;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);

  const normalizedPwd = pwd.toLowerCase().trim();
  const notCommon = !COMMON_PASSWORD_LIST.includes(normalizedPwd);

  let notContainsEmail = true;
  if (em && em.includes('@')) {
    const localPart = em.split('@')[0];
    if (localPart.length >= 3 && normalizedPwd.includes(localPart)) {
      notContainsEmail = false;
    } else if (localPart.length >= 3) {
      const parts = localPart.split(/[._+\-]+/);
      for (const p of parts) {
        if (p.length >= 3 && normalizedPwd.includes(p)) {
          notContainsEmail = false;
          break;
        }
      }
    }
  }

  const passedCount = [minLength, hasLetter, hasDigit, notCommon, notContainsEmail].filter(Boolean).length;
  const allPassed = passedCount === 5;

  return {
    minLength,
    hasLetter,
    hasDigit,
    notCommon,
    notContainsEmail,
    passedCount,
    allPassed,
  };
}

export default function PasswordPolicyChecklist({ password = '', email = '' }) {
  const { t } = useTranslation();
  const rules = checkPasswordRules(password, email);

  const items = [
    {
      key: 'length',
      label: t('auth.policy_length', '8 to 72 characters long'),
      passed: rules.minLength,
    },
    {
      key: 'letter',
      label: t('auth.policy_letter', 'At least one letter (a-z, A-Z)'),
      passed: rules.hasLetter,
    },
    {
      key: 'digit',
      label: t('auth.policy_digit', 'At least one digit (0-9)'),
      passed: rules.hasDigit,
    },
    {
      key: 'not_common',
      label: t('auth.policy_not_common', 'Not an easily guessable password'),
      passed: rules.notCommon,
    },
    {
      key: 'not_email',
      label: t('auth.policy_not_email', 'Does not contain your email name'),
      passed: rules.notContainsEmail,
    },
  ];

  return (
    <div
      className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between font-semibold text-stone-700">
        <span className="flex items-center gap-1.5">
          {rules.allPassed ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          )}
          {t('auth.password_requirements', 'Password Requirements')}
        </span>
        <span className={rules.allPassed ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
          {rules.passedCount} / 5
        </span>
      </div>

      <ul className="space-y-1.5 text-stone-600">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            {item.passed ? (
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center shrink-0">
                <X className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
            <span className={item.passed ? 'text-stone-800 font-medium' : 'text-stone-500'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

