import React from 'react';

const AuthorAgreement = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Публічний договір з автором</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Предмет договору</h2>
          <p className="mb-4">
            Цей договір регулює відносини між платформою FanVers та авторами 
            щодо розміщення та монетизації їх творчого контенту.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Права та обов'язки автора</h2>
          <p className="mb-4">
            Автор зберігає всі авторські права на свій контент та має право 
            на отримання винагороди від його використання.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Умови співпраці</h2>
          <p className="mb-4">
            Платформа надає авторам інструменти для публікації, просування 
            та монетизації їх творчості на вигідних умовах.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AuthorAgreement;
