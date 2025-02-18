import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { navigationAPI } from '../../api/navigation/navigationAPI';
import BookDetailOwner from './BookDetailOwner';
import BookDetailReader from './BookDetailReader';
import ChapterRangeSelector from '../../navigation/components/ChapterRangeSelector';
import useBookAnalytics from '../../hooks/useBookAnalytics';
import { BreadCrumb } from '../../main/components/BreadCrumb';
import styles from "../css/BookDetailRouter.module.css";
import BookCart from "./img/image__book-cart.png";
import { Button } from 'react-bootstrap';
import SettingsBook from './img/Setting.svg';
import { Form } from 'react-bootstrap';
import Star from "./img/Star_fill.svg";
import AuthorBook from "./img/author.svg";
import bookMini from "./img/book-mini.svg";
import LeftArrow from "../../main/pages/img/left-arrow.png";
import RightArrow from "../../main/pages/img/right-arrow.png";
import OrangeDot from "../../main/pages/img/orange-dot.png";
import BlueDot from "../../main/pages/img//blue-dot.png";
import Slider from "react-slick";
// import { websiteAdvertisingAPI } from "../../api/website_advertising/website_advertisingAPI";
import { mainAPI } from "../../api/main/mainAPI";
import Edit from "./img/edit.svg";
import Read from "./img/read.png";
import Trash from "./img/Trash.svg";
import CommentImg from "../../main/pages/img/comment.jpg";
import Favorite from "../../main/pages/img/Favorite.png";
import LeftFooter from "./img/left-footer.svg";
import RightFooter from "./img/right-footer.svg";

const NovelCard = ({ title, description, image }) => {
  return (
    <div className="novel-card" style={{ background: "none", minHeight: "auto", height: "min-content" }}>
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
      <span className="novel-title-homepage">{title}</span>


    </div>
  );
};
const ExpandableTags = ({ title, className, items }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <span>{title}:</span>
      <div className={`name-${className.split(" ")[0]}`}>
        {items.slice(0, 2).map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {items.length > 2 && (
          <button className={`expand-btn ${styles.expandBtn}`} onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲" : "▼"}
          </button>
        )}
        {expanded &&
          items
            .slice(2)
            .map((item, index) => <span key={index + 2}>{item}</span>)}
      </div>
    </div>
  );
};

const BookDetailRouter = () => {

  // const { slug } = useParams();
  // const currentUser = useSelector(state => state.auth.user);
  // const [currentStartChapter, setCurrentStartChapter] = useState(1);
  // const { trackView } = useBookAnalytics();

  // const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
  //   queryKey: ['book', slug],
  //   queryFn: () => catalogAPI.fetchBook(slug),
  //   enabled: !!slug,
  // });

  // const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
  //   queryKey: ['paginatedChapters', book?.id, currentStartChapter],
  //   queryFn: () => navigationAPI.getPaginatedChapters(book.id, currentStartChapter),
  //   enabled: !!book?.id,
  // });

  // useEffect(() => {
  //   if (slug) {
  //     trackView(slug);
  //   }
  // }, [slug, trackView]);

  // const handleRangeSelect = (startChapter) => {
  //   setCurrentStartChapter(startChapter);
  // };

  // if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;
  // if (bookError) return <div>Помилка: {bookError.message}</div>;
  // if (!book) return <div>Книгу не знайдено</div>;

  // const isOwner = currentUser && book.owner === currentUser.id;
  // const commonProps = {
  //   book,
  //   chapters: chaptersData?.chapters || [],
  //   currentRange: chaptersData?.current_range,
  //   totalChapters: chaptersData?.total_chapters,
  // };
  const { data: books } = useQuery({
    queryKey: ["books-news"],
    queryFn: () => mainAPI.getBooksNews(),
  });
  const sliderRef = useRef(null);
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    dots: false,
    responsive: [
      {
        breakpoint: 1366,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <>
      <BreadCrumb items={[
        { href: "/", label: "Головна" },
        { href: "/books/:slug", label: "Назва книги" },
      ]} />
      <div className={styles.BookDetailContainer}>



        <div className={styles.headerBookDetail}>
          <div className={styles.BookCartContainer}>
            <div className="novel-image" style={{ maxWidth: "380px", maxHeight: "100%", height: "auto" }}>
              <img src={BookCart} />
            </div>
            <div className={styles.footerBookCartUser}>
              <button className={styles.bookmarks}>
                В закладки
              </button>
            </div>
            {/* <div className={styles.footerBookCartAuthor}>
              <button className={styles.bookmarks}>
                В закладки
              </button>
              <button className={styles.settingBook}>
                <img src={SettingsBook} />
                <span>Налаштування перекладу</span>
              </button>
            </div> */}
          </div>
          <div className={styles.anotherInfoBook}>
            <div className={styles.mainInfoBook}>
              <div className={styles.tableInfoBook}>
                <div className={styles.headerTableInfoBook}>
                  <p>/</p> <span>Nazva knygy </span>
                </div>
                <table className={styles.tableBook}>
                  <tbody>
                    <tr>
                      <td>Автор:</td>
                      <td>Артур Конан Дойл</td>
                    </tr>
                    <tr>
                      <td>Перекладач:</td>
                      <td>Перекладач</td>
                    </tr>
                    <tr>
                      <td>Розділів:</td>
                      <td>16</td>
                    </tr>
                    <tr>
                      <td>Жанр:</td>
                      <td>
                        <ExpandableTags
                          title="Жанри"
                          className={`genres ${styles.genres}`}
                          items={["#фэнтези", "#приключения", "#магический реализм"]}
                        />

                      </td>
                    </tr>
                    <tr>
                      <td>Теги:</td>
                      <td><ExpandableTags
                        title="Теги"
                        className={`tags ${styles.tags}`}
                        items={["#магия", "#хогвартс", "#волшебство"]}
                      /></td>
                    </tr>
                    <tr>
                      <td>Фендом:</td>
                      <td> <ExpandableTags
                        title="Фендом"
                        className={`fandom ${styles.fandom}`}
                        items={["#гарри поттер", "#хогвартс", "#волшебство"]}
                      /></td>
                    </tr>
                    <tr>
                      <td>Країна:</td>
                      <td>Америка</td>
                    </tr>
                    <tr>
                      <td>Статус перекладу:</td>
                      <td>Перекладається</td>
                    </tr>
                    <tr>
                      <td>Статус випуску твору:</td>
                      <td>Виходить</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.rightInfoBook}>
                <div className={styles.thanks}>
                  <div className={styles.fanCoins}>
                    <span>10</span>
                    <p>FanCoins</p>
                  </div>
                  <div className={styles.spanThanks}>
                    подякувати автору
                  </div>
                </div>
                <div className={styles.raiting}>
                  <div className={styles.raitingBook}>
                    <span>Рейтинг твору:</span>
                    <div className={styles.stars}>
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                    </div>
                  </div>
                  <div className={styles.raitingTranslator}>
                    <span>Якість перЕкладу:</span>
                    <div className={styles.stars}>
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                      <img src={Star} />
                    </div>
                  </div>
                </div>
                <img src={AuthorBook} />
              </div>
            </div>
            <button className={styles.translators}>
              <img src={bookMini} />
              <span>Стати новим перекладачем</span>
            </button>
          </div>

        </div>
        <div className={styles.descBookDetail}>
          <div className={styles.headerDescBook}>
            <span>Опис книги:</span>
            <div className={styles.lineHeaderDesc}></div>
          </div>
          <p>Після реєстрації, подаєте заявку на схвалення перекладу (Кнопка: Створити переклад). Після схвалення модератором публікуєте розділи перекладу, зробленого вами з іншої мови.
            Перекладач створює переклад, публікує, та встановлює розділи або публічного доступу, або платними, доступними за підпискою, які можуть придбати нетерплячі користувачі! Перекладач може сам встановити ціну на кожен проект (або взагалі виставити безкоштовно), що перекладається. Це гарна мотивація перекладача, а також швидкий переклад для читачів! Звичайно платно робити не обов’язково, це все на ваш вибір!Перекладач створює переклад, публікує, та встановлює розділи або публічного доступу, або платними, доступними за підпискою, які можуть придбати нетерплячі користувачі! Перекладач може сам встановити ціну на кожен проект (або взагалі виставити безкоштовно), що перекладається. Це гарна мотивація перекладача, а також швидкий переклад для читачів! Звичайно платно робити не обов’язково, це все на ваш вибір!</p>
        </div>
        <div className={styles.anotherBooks}>
          <div className={styles.headerAnotherBooks}>
            <span>Інші роботи автора</span>
            <div className={styles.lineAnotherBooks}></div>
          </div>
          <div className={styles.contentAnotherBooks}>
            <div className="novels-slider-wrapper">
              {books?.length > 0 ? (<>
                <Slider ref={sliderRef} {...settings}>
                  {books.map((ad) => (
                    <NovelCard
                      key={ad.id}
                      title={ad.title}
                      description={ad.description}
                      image={ad.image}
                    />
                  ))}
                </Slider>
                <div className="slider-controls" style={{ padding: "0" }}>
                  <button
                    className="slider-btn left"
                    onClick={() => sliderRef.current.slickPrev()}
                  >

                    <img src={LeftArrow} />
                    <img src={BlueDot} />
                  </button>
                  <button
                    className="slider-btn right"
                    onClick={() => sliderRef.current.slickNext()}
                  >
                    <img src={OrangeDot} />
                    <img src={RightArrow} />
                  </button>
                </div>
              </>
              ) : (
                <div className="no-books-message">Немає доступних книг</div>
              )}

            </div>

          </div>
        </div>
        <div className={styles.chaptersBooks}>
          <div className={styles.headerChapters}>
            <div className={styles.leftHeaderChapters}>
              <button className={styles.bookmarks}>
                Додати роздiл
              </button>
              <button className={styles.bookmarks}>
                Створити том
              </button>
            </div>
            <div className={styles.rightHeaderChapters}>
              <button className={styles.bookmarks}>
                Змiнити порядок роздiлiв
              </button>
            </div>
          </div>
          <div className={styles.containerChapters}>
            <table className={styles.chaptertableReader}>
              {/* chaptertableReader */}
              {/* chaptertableAuthor */}
              <thead>
                <tr>
                  <th></th>
                  {/*chaptertableAuthor */}
                  {/* <th></th> */}
                  {/*chaptertableAuthor */}
                  <th>Назва</th>
                  {/*chaptertableAuthor */}
                  {/* <th></th> */}
                  {/*chaptertableAuthor */}
                  <th>Вартість</th>
                  <th>Створено</th>
                  <th></th>
                  {/*chaptertableAuthor */}
                  {/* <th></th> */}
                  {/*chaptertableAuthor */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>  <Form.Check
                    type="checkbox"
                    id="hide-adult-content"
                    className={`adult-content-checkbox ${styles.chapterCheck}`}
                  /></td>
                  {/*chaptertableAuthor */}
                  {/* <td><input className={styles.inputChapter} type="number" /></td>  */}
                  {/*chaptertableAuthor */}
                  <td ><span className={styles.nameChapter}>Розділ 1: Артур Конан Дойль, частина 1</span></td>
                  {/*chaptertableAuthor */}
                  {/* <td>
                    <button className={styles.editChapter}>
                      <img src={Edit} />
                      <span>Редагувати</span>
                    </button>
                  </td> */}
                  {/*chaptertableAuthor */}
                  <td> <span className={styles.numChapter} >10$</span></td>
                  <td> <span className={styles.numChapter}>13.02.2023</span></td>
                  <td> <button className={styles.readChapter}>
                    <img src={Read} />
                    <span>Читати</span>
                  </button>
                  </td>
                 {/*chaptertableAuthor */}
                   {/*  <td>
               
                   <button className={styles.trashChapter}>
                    <img src={Trash} />
                    <span>Видалити</span>
                  </button></td> */}
                   {/*chaptertableAuthor */}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* COMMENTS */}
      </div>
      {/* {chaptersData?.total_chapters > 0 && (
        <div className="total-chapters">
          Всього розділів: {chaptersData.total_chapters}
        </div>
      )}
      {chaptersData?.page_ranges && chaptersData.page_ranges.length > 0 && (
        <ChapterRangeSelector
          pageRanges={chaptersData.page_ranges}
          currentRange={chaptersData.current_range}
          onRangeSelect={handleRangeSelect}
        />
      )} */}
      {/* {isOwner ? (
        <BookDetailOwner {...commonProps} />
      ) : (
        <BookDetailReader {...commonProps} />
      )} */}
       <div className={`comments-section ${styles.CommentsSection}`}>
          <h2>Коментарі</h2>
          <div className={styles.inputComment}>
            <input placeholder='Прокоментуйте...' type='text'/>
            <button type='submit'><img src={RightArrow}></img></button>
          </div>
          <div className="comment-block">
            <img className="user-img" src={CommentImg} />
            <div className="all-text-comment">
              <div className="info-user-comment">
                <div className="name-user-comment">Констянтин Петрович</div>
                <div className="last-seen">5 годин тому</div>
              </div>
              <div className="content-comment">
                Вітання. Добро пожалувати в систему перекладів «UA Translate».
                Цей сайт призначений для професійних мов любительських
                перекладів будь-яких новелів, фанфіків, ранобе з різних мов.
                Ваші улюблені ранобе, новели та інше на українській мові!
              </div>
              <div className="button-comment">
                <div className="left-button-comment">
                  <div className="favorite">
                    <img src={Favorite} />
                    <span>5</span>
                  </div>
                  <button>Відповісти</button>
                </div>
                <div className="right-button-comment">
                  <img src={Trash} />
                  <button>Видалити коментар</button>
                </div>
              </div>
            </div>
            <img className={styles.LeftFooter} src={LeftFooter}/>
            <img className={styles.RightFooter} src={RightFooter}/>
          </div>
          {/* {isAuthenticated ? (
            <CommentForm onSubmit={handleCommentSubmit} />
          ) : (
            <p>Увійдіть, щоб залишити коментар</p>
          )}
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={handleCommentSubmit}
                onReaction={handleReaction}
                isAuthenticated={isAuthenticated}
              />
            ))
          ) : (
            <p>Коментарів поки ще немає.</p>
          )} */}
        </div>
    </>
  );
};

export default BookDetailRouter; 