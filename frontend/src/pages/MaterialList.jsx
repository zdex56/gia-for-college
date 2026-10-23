import { useEffect, useState } from 'react';
import { getMaterials } from '../api.js';
import MessageBox from '../components/MessageBox.jsx';

const withComma = (number) => number.replace('.', ',');

export default function MaterialList({ onOpenForm }) {
  const [materials, setMaterials] = useState([]);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    document.title = 'Список материалов';
    getMaterials()
      .then(setMaterials)
      .catch((error) => setErrorText(error.message));
  }, []);

  return (
    <div>
      <img src="/logo.png" alt="Арома Дом" height="60" />
      <h1>Список материалов</h1>
      <button onClick={() => onOpenForm(null)}>Добавить материал</button>
      {materials.map((material) => (
        <div key={material.id} className="card" onClick={() => onOpenForm(material.id)}>
          <div>{material.typeName}</div>
          <b>{material.name}</b>
          <div>
            Минимальное количество: {Number(material.minQuantity)} {material.unitName}
          </div>
          <div>
            Количество на складе: {Number(material.stockQuantity)} {material.unitName}
          </div>
          <div>Цена: {withComma(Number(material.price).toFixed(2))} р</div>
          <div>
            Требуемое количество: {withComma(Number(material.requiredQuantity).toFixed(2))} {material.unitName}
          </div>
        </div>
      ))}
      {errorText && <MessageBox type="error" text={errorText} onClose={() => setErrorText('')} />}
    </div>
  );
}
