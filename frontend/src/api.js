const baseUrl = 'http://localhost:3000';

const request = async (url, options) => {
  let response;
  try {
    response = await fetch(baseUrl + url, options);
  } catch {
    throw new Error('Нет связи с сервером. Проверьте, что сервер запущен, и повторите действие.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Не удалось выполнить операцию. Повторите действие позже.');
  }
  return data;
};

export const getMaterials = () => request('/api/materials');
export const getMaterial = (id) => request(`/api/materials/${id}`);
export const getMaterialProducts = (id) => request(`/api/materials/${id}/products`);
export const getMaterialTypes = () => request('/api/material-types');
export const getUnits = () => request('/api/units');

export const saveMaterial = (id, material) =>
  request(id ? `/api/materials/${id}` : '/api/materials', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(material),
  });
