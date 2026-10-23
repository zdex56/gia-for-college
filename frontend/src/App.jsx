import { useState } from 'react';
import MaterialList from './pages/MaterialList.jsx';
import MaterialForm from './pages/MaterialForm.jsx';
import MaterialProducts from './pages/MaterialProducts.jsx';

export default function App() {
  const [page, setPage] = useState({ name: 'list' });

  if (page.name === 'form') {
    return (
      <MaterialForm
        materialId={page.id}
        onBack={() => setPage({ name: 'list' })}
        onOpenProducts={(id) => setPage({ name: 'products', id })}
      />
    );
  }

  if (page.name === 'products') {
    return <MaterialProducts materialId={page.id} onBack={() => setPage({ name: 'form', id: page.id })} />;
  }

  return <MaterialList onOpenForm={(id) => setPage({ name: 'form', id })} />;
}
