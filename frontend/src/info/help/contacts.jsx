import React from 'react';

const Contacts = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Контакти</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Служба підтримки</h3>
            <p className="text-gray-700 mb-2">Email: support@fanvers.com</p>
            <p className="text-gray-700 mb-2">Телефон: +380 44 123 45 67</p>
            <p className="text-gray-700">Графік роботи: Пн-Пт 9:00-18:00</p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Технічна підтримка</h3>
            <p className="text-gray-700 mb-2">Email: tech@fanvers.com</p>
            <p className="text-gray-700">Для технічних питань та багів</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Юридичні питання</h3>
            <p className="text-gray-700 mb-2">Email: legal@fanvers.com</p>
            <p className="text-gray-700">Для правових питань та скарг</p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Співпраця</h3>
            <p className="text-gray-700 mb-2">Email: partnership@fanvers.com</p>
            <p className="text-gray-700">Для бізнес-партнерів та рекламодавців</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
