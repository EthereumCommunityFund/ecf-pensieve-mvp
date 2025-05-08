import { DataProvider } from './components/dataContext';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DataProvider>{children}</DataProvider>;
}
