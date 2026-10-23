import { useEffect, useState } from 'react';
import { getMaterial, getMaterialTypes, getUnits, saveMaterial } from '../api.js';
import MessageBox from '../components/MessageBox.jsx';

const emptyForm = {
  typeId: '',
  name: '',
  price: '',
  unitId: '',
  packageQuantity: '',
  stockQuantity: '',
  minQuantity: '',
};

export default function MaterialForm({ materialId, onBack, onOpenProducts }) {
  const [form, setForm] = useState(emptyForm);
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    document.title = materialId ? 'Редактирование материала' : 'Добавление материала';
    const load = async () => {
      setTypes(await getMaterialTypes());
      setUnits(await getUnits());
      if (materialId) {
        setForm(await getMaterial(materialId));
      }
    };
    load().catch((error) => setMessage({ type: 'error', text: error.message }));
  }, [materialId]);

  const changeField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      await saveMaterial(materialId, form);
      setMessage({ type: 'info', text: 'Данные материала сохранены.', saved: true });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const closeMessage = () => {
    const saved = message.saved;
    setMessage(null);
    if (saved) {
      onBack();
    }
  };

  return (
    <div>
      <h1>{materialId ? 'Редактирование материала' : 'Добавление материала'}</h1>
      <form onSubmit={save} noValidate>
        <label>Тип материала</label>
        <select name="typeId" value={form.typeId} onChange={changeField}>
          <option value="">Выберите тип</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <label>Наименование</label>
        <input name="name" value={form.name} onChange={changeField} />
        <label>Цена единицы материала</label>
        <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={changeField} />
        <label>Единица измерения</label>
        <select name="unitId" value={form.unitId} onChange={changeField}>
          <option value="">Выберите единицу</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        <label>Количество в упаковке</label>
        <input type="number" step="any" min="0" name="packageQuantity" value={form.packageQuantity} onChange={changeField} />
        <label>Количество на складе</label>
        <input type="number" step="any" min="0" name="stockQuantity" value={form.stockQuantity} onChange={changeField} />
        <label>Минимальное количество</label>
        <input type="number" step="any" min="0" name="minQuantity" value={form.minQuantity} onChange={changeField} />
        <button type="submit">Сохранить</button>
        {materialId && (
          <button type="button" onClick={() => onOpenProducts(materialId)}>
            Продукция
          </button>
        )}
        <button type="button" onClick={onBack}>
          Назад
        </button>
      </form>
      {message && <MessageBox type={message.type} text={message.text} onClose={closeMessage} />}
    </div>
  );
}
