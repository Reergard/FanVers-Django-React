import React from 'react';

const ContentRules = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Правила розміщення авторського контенту</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Авторські права</h2>
          <p className="mb-4">
            Розміщуючи контент на платформі, ви підтверджуєте, що маєте всі необхідні 
            права на його публікацію та використання.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Заборонений контент</h2>
          <p className="mb-4">
            Заборонено розміщувати контент, що порушує авторські права, містить 
            образливі матеріали або порушує законодавство України.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Модерація</h2>
          <p className="mb-4">
            Всі матеріали проходять попередню модерацію. Адміністрація залишає за собою 
            право видаляти контент, що не відповідає правилам платформи.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContentRules;
