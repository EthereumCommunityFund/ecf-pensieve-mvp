import { DataProvider } from './components/dataContext';
import ProfileLayout from './components/layout/ProfileLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <ProfileLayout>{children}</ProfileLayout>
    </DataProvider>
  );
}
