'use client';

import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useNewTransaction } from './hooks/useNewTransaction';
import { NewTransactionForm } from './components/NewTransactionForm';

export default function NewTransactionPage() {
  const router = useRouter();
  const {
    formData,
    setFormData,
    errors,
    categories,
    categoriesLoading,
    mutation,
    handleSubmit,
  } = useNewTransaction();

  if (categoriesLoading && categories.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <NewTransactionForm
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/transactions')}
      isPending={mutation.isPending}
    />
  );
}
