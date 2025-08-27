import React from 'react';

const Payment = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Оплата</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Способи оплати</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Банківські картки</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Visa</p>
                <p>• MasterCard</p>
                <p>• Міжнародні та українські картки</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Електронні гаманці</h3>
              <div className="space-y-2 text-gray-700">
                <p>• PayPal</p>
                <p>• Stripe</p>
                <p>• Локальні платіжні системи</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Реквізити для оплати</h2>
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="space-y-2">
              <p><strong>Отримувач:</strong> ТОВ "ФанВерс"</p>
              <p><strong>IBAN:</strong> UA123456789012345678901234567</p>
              <p><strong>Банк:</strong> ПриватБанк</p>
              <p><strong>Призначення:</strong> Оплата послуг платформи FanVers</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Безпека платежів</h2>
          <div className="border rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              Всі платежі захищені сучасними протоколами шифрування SSL/TLS. 
              Ми не зберігаємо дані ваших банківських карток.
            </p>
            <div className="flex space-x-4">
              <div className="text-green-600 font-semibold">✓ Безпечно</div>
              <div className="text-green-600 font-semibold">✓ Шифровано</div>
              <div className="text-green-600 font-semibold">✓ Захищено</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Payment;
