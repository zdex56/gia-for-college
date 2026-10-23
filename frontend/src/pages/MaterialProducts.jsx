import { useEffect, useState } from 'react';
import { getMaterial, getMaterialProducts } from '../api.js';
import MessageBox from '../components/MessageBox.jsx';

export default function MaterialProducts({ materialId, onBack }) {
  const [material, setMaterial] = useState(null);
  const [products, setProducts] = useState([]);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    document.title = 'Продукция материала';
    const load = async () => {
      setMaterial(await getMaterial(materialId));
      setProducts(await getMaterialProducts(materialId));
    };
    load().catch((error) => setErrorText(error.message));
  }, [materialId]);

  return (
    <div>
      <h1>Продукция материала</h1>
      {material && <h2>{material.name}</h2>}
      <button onClick={onBack}>Назад</button>
      {products.map((product) => (
        <div key={product.id} className="card">
          {product.name}: {Number(product.materialQuantity)} {material.unitName}
        </div>
      ))}
      {errorText && <MessageBox type="error" text={errorText} onClose={() => setErrorText('')} />}
    </div>
  );
}
