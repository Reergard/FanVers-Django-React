import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Політика компанії щодо обробки персональних даних</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Збір інформації</h2>
          <p className="mb-4">
            Ми збираємо тільки ту інформацію, яка необхідна для надання послуг 
            та покращення якості обслуговування користувачів.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Використання cookies</h2>
          <p className="mb-4">
            Наш сайт використовує cookies для збереження налаштувань користувача 
            та аналітики. Ви можете відключити cookies у налаштуваннях браузера.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Захист даних</h2>
          <p className="mb-4">
            Ми вживаємо всіх необхідних заходів для захисту ваших персональних даних 
            від несанкціонованого доступу та використання.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
