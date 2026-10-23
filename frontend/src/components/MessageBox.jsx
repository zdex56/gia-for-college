const types = {
  error: { title: 'Ошибка', icon: '⛔' },
  info: { title: 'Информация', icon: 'ℹ️' },
};

export default function MessageBox({ type, text, onClose }) {
  const { title, icon } = types[type];

  return (
    <dialog open>
      <h3>{title}</h3>
      <p>
        {icon} {text}
      </p>
      <button onClick={onClose}>Закрыть</button>
    </dialog>
  );
}
