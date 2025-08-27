import React from 'react';

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Часті запитання (FAQ)</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Як зареєструватися на платформі?</h3>
          <p className="text-gray-700">
            Для реєстрації перейдіть на сторінку "Реєстрація" та заповніть необхідні поля. 
            Після підтвердження email ваш акаунт буде активовано.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Як додати свій твір?</h3>
          <p className="text-gray-700">
            У розділі "Додати твір" ви можете завантажити файл або створити новий твір 
            безпосередньо на платформі. Всі матеріали проходять модерацію.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Як отримати винагороду за твір?</h3>
          <p className="text-gray-700">
            Винагорода нараховується автоматично при досягненні мінімальної суми. 
            Ви можете вивести кошти на банківську картку або електронний гаманець.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
