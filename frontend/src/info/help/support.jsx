import React from 'react';

const Support = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Написати у підтримку</h1>
      
      <div className="max-w-2xl">
        <form className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Тема звернення
            </label>
            <select 
              id="subject" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Виберіть тему</option>
              <option value="technical">Технічна проблема</option>
              <option value="payment">Питання по платежам</option>
              <option value="content">Питання по контенту</option>
              <option value="account">Проблеми з акаунтом</option>
              <option value="other">Інше</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Ваш email
            </label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Повідомлення
            </label>
            <textarea 
              id="message" 
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Опишіть вашу проблему детально..."
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Надіслати звернення
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Швидка допомога:</h3>
          <p className="text-sm text-gray-600">
            Перед зверненням перевірте розділ FAQ - можливо, там вже є відповідь на ваше питання.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
