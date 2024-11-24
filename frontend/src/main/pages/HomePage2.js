import React from 'react';

const HomePage2 = () => {
    return (
        <section className="home-about-section">
            <div className="container">
                <div className="about-content">
                    <h2>О нашем проекте</h2>
                    <p>
                        Здесь можно разместить информацию о вашем проекте,
                        его целях и преимуществах.
                    </p>
                </div>

                <div className="features">
                    <div className="feature-item">
                        <h3>Функция 1</h3>
                        <p>Описание первой ключевой функции</p>
                    </div>
                    <div className="feature-item">
                        <h3>Функция 2</h3>
                        <p>Описание второй ключевой функции</p>
                    </div>
                    <div className="feature-item">
                        <h3>Функция 3</h3>
                        <p>Описание третьей ключевой функции</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage2;