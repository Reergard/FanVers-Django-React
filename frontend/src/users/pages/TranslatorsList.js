import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { usersAPI } from '../../api/users/usersAPI';
import "../styles/TranslatorsList.css";
import Border from '../../main/pages/img/border.png';
import ArrowMobile from '../../main/images/arrow-mobile.svg';
import { BreadCrumb } from '../../main/components/BreadCrumb';

const TranslatorsList = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);

  const showMoreUsers = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  useEffect(() => {
    const fetchTranslators = async () => {
      try {
        console.log("🔍 Завантажуємо список перекладачів...");
        const data = await usersAPI.getTranslatorsList();
        console.log("📚 Отримано дані перекладачів:", data);
        setTranslators(data);
      } catch (error) {
        console.error("❌ Помилка при завантаженні списку перекладачів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslators();
  }, []);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    );
  }

  if (!translators.length) {
    return (
      <div className="container-profile-user">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/translators", label: "Перекладачі" },
          ]}
        />
        <Container className="mt-4">
          <h2 className="mb-4">Перекладачі та Літератори</h2>
          <p className="text-center">На даний момент немає активних перекладачів</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="container-profile-user">
      <BreadCrumb
        items={[
          { href: "/", label: "Головна" },
          { href: "/translators", label: "Перекладачі" },
        ]}
      />
      <Row xs={1} md={2} lg={3} className="g-4" style={{ margin: "0 auto" }}>
        <div className="header-translators">
          <div className="left-header-translators">
            <span>Показано {Math.min(visibleCount, translators.length)} з {translators.length} перекладачів</span>
          </div>
          <div className="sort-translators">
            <span>Сортувати за:</span>{" "}
            <div className="params-sort-all params-sort-all-mobile">
              <div className="sort-books">Кількість книг</div>
              <div className="sort-arrow">▼</div>
            </div>
          </div>
        </div>
        <div className="rating-table-container">
          <table className="rating-table">
            <thead>
              <tr>
                <th>Місце в рейтингу</th>
                <th>Никнейм</th>
                <th className="books-header">К-сть книг</th>
                <th>
                  {" "}
                  <div className="mobile-translator-table">
                    <div className="arrow-mobile-left">
                      <svg
                        width="9"
                        height="10"
                        viewBox="0 0 9 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.44643 8.70096C1.11309 8.89341 0.696426 8.65285 0.696426 8.26795L0.696426 1.33975C0.696426 0.954848 1.11309 0.714284 1.44643 0.906734L7.44643 4.37083C7.77976 4.56329 7.77976 5.04441 7.44643 5.23686L1.44643 8.70096Z"
                          stroke="#F58807"
                        />
                      </svg>
                    </div>
                    К-сть коментарів
                    <div className="arrow-mobile-right">
                      <svg
                        width="9"
                        height="10"
                        viewBox="0 0 9 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.44643 8.70096C1.11309 8.89341 0.696426 8.65285 0.696426 8.26795L0.696426 1.33975C0.696426 0.954848 1.11309 0.714284 1.44643 0.906734L7.44643 4.37083C7.77976 4.56329 7.77976 5.04441 7.44643 5.23686L1.44643 8.70096Z"
                          stroke="#F58807"
                        />
                      </svg>
                    </div>
                  </div>
                </th>
                <th>Останнє відвідування</th>
              </tr>
            </thead>
            <tbody>
              {translators.slice(0, visibleCount).map((translator, index) => (
                <tr key={translator.id || index}>
                  <td>{index + 1}</td>
                  <td>{translator.username || translator.nickname}</td>
                  <td>{translator.books_count || 0}</td>
                  <td>{translator.comments_count || 0}</td>
                  <td>{translator.last_visit || 'Н/Д'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleCount < translators.length && (
            <button className="show-more-btn" onClick={showMoreUsers}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_2044_17077)">
                  <path
                    d="M12.18 16C13.6835 15.3632 14.9508 14.2903 15.8104 12.9264C16.6701 11.5625 17.0808 9.97333 16.9868 8.37384C16.8929 6.77435 16.2989 5.24163 15.2852 3.98291C14.2715 2.72418 12.887 1.80017 11.3188 1.33579C9.75061 0.871417 8.0744 0.889071 6.5168 1.38637C4.9592 1.88367 3.59534 2.83663 2.6096 4.11641C1.62387 5.39619 1.0638 6.94107 1.00513 8.54217C0.946461 10.1433 1.39201 11.7234 2.28155 13.0689"
                    stroke="#F58807"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12.0683 12.6361L11.4533 16.704L15.5211 17.319"
                    stroke="#F58807"
                    strokeLinecap="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2044_17077">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Показати ще
            </button>
          )}
        </div>
      </Row>
    </div>
  );
};

export default TranslatorsList;
