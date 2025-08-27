import React from 'react';

const UserAgreement = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Угода користувача</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Загальні положення</h2>
          <p className="mb-4">
            Ця Угода користувача регулює відносини між користувачем та платформою FanVers 
            щодо використання послуг та функціональності сайту.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Умови використання</h2>
          <p className="mb-4">
            Користувач зобов'язується використовувати платформу відповідно до 
            встановлених правил та не порушувати права інших користувачів.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Відповідальність</h2>
          <p className="mb-4">
            Користувач несе повну відповідальність за контент, який він розміщує 
            на платформі, та за дотримання авторських прав.
          </p>
        </section>
      </div>
    </div>
  );
};

export default UserAgreement;
