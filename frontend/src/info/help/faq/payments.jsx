import React from 'react';

const PaymentsFAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">FAQ: Платежі та винагороди</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Які способи оплати приймаються?</h3>
          <p className="text-gray-700">
            Ми приймаємо оплату банківськими картками (Visa, MasterCard), 
            електронними гаманцями та банківськими переказами.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Як нараховується винагорода?</h3>
          <p className="text-gray-700">
            Винагорода нараховується за кожне прочитання вашого твору. 
            Сума залежить від типу контенту та популярності.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Коли можна вивести кошти?</h3>
          <p className="text-gray-700">
            Вивід коштів можливий при досягненні мінімальної суми 100 грн. 
            Заявки обробляються протягом 3-5 робочих днів.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsFAQ;
