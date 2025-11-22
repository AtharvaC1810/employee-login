import { redirect } from 'next/navigation';

export default function Home() {
  // Immediately redirect users to the login page
  redirect('/login');
}