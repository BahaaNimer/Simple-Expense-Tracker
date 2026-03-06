import PageLayout from '../components/PageLayout';
import Header from '../components/Header';
import { RequireAuth } from '../components/RequireAuth';

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <PageLayout>
        <Header />
        {children}
      </PageLayout>
    </RequireAuth>
  );
}
