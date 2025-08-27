import React from 'react';

const SayThanks = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Сказати «Дякую!»</h1>
      
      <div className="space-y-8">
        <section className="text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              Якщо вам сподобався наш проект і ви хочете підтримати його розвиток, 
              ми будемо вдячні за будь-яку допомогу!
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Способи підтримки</h2>
              <div className="space-y-3 text-blue-700">
                <p>• Донат через платіжні системи</p>
                <p>• Розповсюдження інформації про проект</p>
                <p>• Надсилання відгуків та пропозицій</p>
                <p>• Участь у тестуванні нових функцій</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">Донат</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">☕</div>
              <h3 className="text-lg font-semibold mb-2">Кава</h3>
              <p className="text-gray-600 mb-3">50 грн</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Підтримати
              </button>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">🍕</div>
              <h3 className="text-lg font-semibold mb-2">Піца</h3>
              <p className="text-gray-600 mb-3">200 грн</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Підтримати
              </button>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-lg font-semibold mb-2">Подарунок</h3>
              <p className="text-gray-600 mb-3">500 грн</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Підтримати
              </button>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Інші способи підтримки</h3>
            <p className="text-gray-700 mb-4">
              Напишіть нам про те, що вам подобається в проекті, або поділіться ідеями 
              для покращення. Ваша думка дуже важлива для нас!
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
              Написати відгук
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SayThanks;
