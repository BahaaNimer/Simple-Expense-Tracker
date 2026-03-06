import AuthLayout from '../components/AuthLayout';

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
