import React from 'react';

const BalanceHelp = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Не поповнився баланс?</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Перевірте статус платежу</h3>
          <p className="text-gray-700">
            Якщо платіж не пройшов, перевірте статус у вашому банку або 
            електронному гаманці. Іноді потрібно до 24 годин для обробки.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Зверніться до підтримки</h3>
          <p className="text-gray-700">
            Якщо проблема залишається, зверніться до служби підтримки. 
            Надайте номер транзакції та деталі платежу.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Альтернативні способи</h3>
          <p className="text-gray-700">
            Спробуйте інший спосіб оплати або зверніться до банку 
            для перевірки можливих обмежень.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceHelp;
