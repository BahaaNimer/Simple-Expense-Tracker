import AuthLayout from '../components/AuthLayout';

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
