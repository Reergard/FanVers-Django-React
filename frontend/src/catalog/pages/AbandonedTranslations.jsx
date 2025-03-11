import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchBooks } from "../../api/catalog/catalogAPI";
import { websiteAdvertisingAPI } from "../../api/website_advertising/website_advertisingAPI";
import { handleCatalogApiError } from "../utils/errorUtils";
import { getBookTypeLabel } from "../utils/bookUtils";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import "../css/Catalog.css";
import { useSelector } from "react-redux";
import { BreadCrumb } from "../../main/components/BreadCrumb";
import HomePage1 from "../../main/pages/HomePage1";
const NovelCard = ({ title, description, image, slug }) => {
  return (
    <div className="novel-card mobal">
      <div className="novel-cover">
        <div className="image-container">
          <div className="image-wrapper">
            <img
              src={image}
              alt={title}
              className="novel-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <div
              className="divider"
              role="separator"
              aria-orientation="vertical"
            />
            <span className="novel-letter">a</span>
          </div>
        </div>
      </div>
      <div className="all-desc-catalog">
        <div className="one-desc">
          <div className="name-desc-catalog">Дата створення </div>
          <span>14.02.2023</span>
        </div>
        <div className="one-desc">
          <div className="name-desc-catalog">Дата останньої активности </div>
          <span>14.02.2023</span>
        </div>
        <div className="one-desc">
          <div className="name-desc-catalog">Переглядів за день</div>
          <span>150</span>
        </div>
        <div className="one-desc">
          <div className="name-desc-catalog">Дохід за день </div>
          <span>15$</span>
        </div>
        <div className="one-desc">
          <div className="name-desc-catalog">Дохід за місяць</div>
          <span>15$</span>
        </div>
      </div>
    </div>
  );
};

const AbandonedTranslations = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);

  const showMoreBooks = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };
  const hideAdultContent = useSelector(
    (state) => state.userSettings.hideAdultContent
  );

  const { data: advertisedBooks, isLoading: isLoadingAds } = useQuery({
    queryKey: ["catalogAds"],
    queryFn: websiteAdvertisingAPI.getCatalogAds,
    onError: (error) => {
      console.error("Error loading catalog advertisements:", error);
    },
  });

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await fetchBooks();
        setBooks(booksData);
      } catch (error) {
        handleCatalogApiError(error, toast);
        setError("Не вдалось завантажити данні");
      }
    };

    loadBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    if (hideAdultContent && book.adult_content) {
      return false;
    }
    return true;
  });

  return (
    <section>
      <Container fluid className="catalog-section" id="catalog">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/abandoned-translations", label: "Покинуті переклади" },
          ]}
        />
        <Container className="catalog-content">
          <HomePage1 />

          {error ? (
            <p>{error}</p>
          ) : (
            <div className="all-ell-catalog">
              <div className="sort">
                <span>Сортувати за:</span>{" "}
                <div className="params-sort-all">
                  <div className="sort-books">Кількість книг</div>
                  <div className="sort-arrow">▼</div>
                </div>
              </div>
              <div className="novels-container-catalog">
                {filteredBooks.slice(0, visibleCount).map((book) => (
                  <NovelCard
                    key={book.id}
                    title={book.title}
                    description={book.description}
                    image={book.image}
                    slug={book.slug}
                  />
                ))}
              </div>
              {visibleCount < filteredBooks.length && (
                <button className="show-more-btn" onClick={showMoreBooks}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_2044_17077)">
                      <path
                        d="M12.18 16C13.6835 15.3632 14.9508 14.2903 15.8104 12.9264C16.6701 11.5625 17.0808 9.97333 16.9868 8.37384C16.8929 6.77435 16.2989 5.24163 15.2852 3.98291C14.2715 2.72418 12.887 1.80017 11.3188 1.33579C9.75061 0.871417 8.0744 0.889071 6.5168 1.38637C4.9592 1.88367 3.59534 2.83663 2.6096 4.11641C1.62387 5.39619 1.0638 6.94107 1.00513 8.54217C0.946461 10.1433 1.39201 11.7234 2.28155 13.0689"
                        stroke="#F58807"
                        stroke-linecap="round"
                      />
                      <path
                        d="M12.0683 12.6361L11.4533 16.704L15.5211 17.319"
                        stroke="#F58807"
                        stroke-linecap="round"
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
          )}
        </Container>
      </Container>
    </section>
  );
};

export default AbandonedTranslations;
