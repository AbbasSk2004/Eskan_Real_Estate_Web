import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Cookie Settings',
  description: 'Cookie preferences for ESKAN Real Estate.'
};

export default function CookieSettingsPage() {
  redirect('/cookies');
  return null;
}