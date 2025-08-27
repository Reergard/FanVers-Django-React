import React from 'react';

const TranslatorAgreement = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Договір між автором та перекладачем</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Предмет договору</h2>
          <p className="mb-4">
            Цей договір регулює відносини між автором оригінального твору та 
            перекладачем щодо створення перекладу на інші мови.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Права перекладача</h2>
          <p className="mb-4">
            Перекладач має право на визнання його творчого внеску та отримання 
            справедливої винагороди за виконану роботу.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Якість перекладу</h2>
          <p className="mb-4">
            Перекладач зобов'язується забезпечити високу якість перекладу, 
            зберігаючи стиль та дух оригінального твору.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TranslatorAgreement;
