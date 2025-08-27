import React from 'react';

const Confidentiality = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Угода конфіденційності</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Зберігання таємниці</h2>
          <p className="mb-4">
            Сторони зобов'язуються зберігати конфіденційність інформації, 
            отриманої в процесі співпраці, та не розголошувати її третім особам.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Обмеження доступу</h2>
          <p className="mb-4">
            Доступ до конфіденційної інформації мають тільки особи, безпосередньо 
            залучені до виконання зобов'язань за цією угодою.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Термін дії</h2>
          <p className="mb-4">
            Зобов'язання щодо збереження конфіденційності діють протягом 5 років 
            після закінчення терміну дії цієї угоди.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Confidentiality;
