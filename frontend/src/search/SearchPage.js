import React, { useState, useEffect } from 'react';
import {searchBooks} from './api';
import { Container } from 'react-bootstrap';
import './css/Search.css';
import {fetchCountries, fetchFandoms, fetchGenres, fetchTags} from "../catalog/api";
import MultiSelect from "./components/MultiSelect";

function SearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [genres, setGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [fandoms, setFandoms] = useState([]);
    const [countries, setCountries] = useState([]); // Добавляем состояние для стран
    const [filters, setFilters] = useState({
        'adult_content': false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadGenres = async () => {
            const data = await fetchGenres();
            setGenres(data);
        };

        const loadTags = async () => {
            const data = await fetchTags();
            setTags(data);
        };

        const loadCountries = async () => {
            const data = await fetchCountries();
            setCountries(data);
        };

        const loadFandoms = async () => {
            const data = await fetchFandoms();
            setFandoms(data);
        };

        loadGenres();
        loadTags();
        loadCountries();
        loadFandoms();
        handleSearch();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const query = createQueryString(filters);
            const data = await searchBooks(query);
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    const createQueryString = (filters) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach((key) => {
            const value = filters[key];

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    params.append(key, item);
                });
            } else if (value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        return params.toString();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: checked,
        }));
    };

    const handleFilterChange = (filterType, selectedValues) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterType]: selectedValues,
        }));
    };

    const handleOrderChange = (event) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            order: event.target.value,
        }));
    };

    // const handleCountryChange = (event) => {
    //     const selectedCountryId = event.target.value;
    //     setFilters((prevFilters) => ({
    //         ...prevFilters,
    //         country: selectedCountryId,
    //     }));
    // };

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <div>
                        <h1>Пошук книг</h1>
                        <div>
                            <input
                                type="text"
                                name="title"
                                value={filters.title || ''}
                                onChange={handleInputChange}
                                placeholder="Title"
                            />
                            {/*<select*/}
                            {/*    name="country"*/}
                            {/*    onChange={handleCountryChange}*/}
                            {/*    defaultValue=""*/}
                            {/*>*/}
                            {/*    <option value="" disabled>Виберіть країну</option>*/}
                            {/*    {countries.map(country => (*/}
                            {/*        <option key={country.id} value={country.id}>*/}
                            {/*            {country.name}*/}
                            {/*        </option>*/}
                            {/*    ))}*/}
                            {/*</select>*/}
                            <input
                                type="number"
                                name="min_chapters"
                                value={filters.min_chapters || ''}
                                onChange={handleInputChange}
                                placeholder="Min Chapters"
                            />
                            <input
                                type="number"
                                name="max_chapters"
                                value={filters.max_chapters || ''}
                                onChange={handleInputChange}
                                placeholder="Max Chapters"
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    name="adult_content"
                                    checked={filters.adult_content || false}
                                    onChange={handleCheckboxChange}
                                />
                                Контент 18+
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="exclude_viewed"
                                    checked={filters.exclude_viewed || false}
                                    onChange={handleCheckboxChange}
                                />
                                Тільки непереглянуті
                            </label>
                            <select
                                name="order"
                                value={filters.order || 'title'}
                                onChange={handleOrderChange}
                            >
                                <option value="title">Title</option>
                                <option value="last_updated">Останнє оновлення</option>
                                <option value="chapter_count">К-сть розділів</option>
                            </select>
                        </div>
                        <MultiSelect
                            items={countries}
                            onChange={(selected) => handleFilterChange('countries', selected)}
                            title={'Країни'}
                        />
                        <MultiSelect
                            items={genres}
                            onChange={(selected) => handleFilterChange('genres', selected)}
                            title={'Жанри'}
                        />
                        <MultiSelect
                            items={genres}
                            onChange={(selected) => handleFilterChange('exclude_genres', selected)}
                            title={'Виключити жанри'}
                        />
                        <MultiSelect
                            items={tags}
                            onChange={(selected) => handleFilterChange('tags', selected)}
                            title={'Теги'}
                        />
                        <MultiSelect
                            items={tags}
                            onChange={(selected) => handleFilterChange('exclude_tags', selected)}
                            title={'Виключити теги'}
                        />
                        <MultiSelect
                            items={fandoms}
                            onChange={(selected) => handleFilterChange('fandoms', selected)}
                            title={'Фандом'}
                        />
                        <MultiSelect
                            items={fandoms}
                            onChange={(selected) => handleFilterChange('exclude_fandoms', selected)}
                            title={'Виключити фандом'}
                        />
                        <div>
                            <button onClick={handleSearch} disabled={loading}>
                                {loading ? 'Завантаження...' : 'Шукати'}
                            </button>
                        </div>
                        <div>
                            {searchResults.map((book) => (
                                <div key={book.id}>
                                    <h2>{book.title} ({book.title_en})</h2>
                                    <p><strong>Автор:</strong> {book.author}</p>
                                    <p><strong>Опис:</strong> {book.description || 'Опис відсутній'}</p>
                                    <p><strong>Країна:</strong> {book.country.name}</p>
                                    <p><strong>Останнє
                                        оновлення:</strong> {new Date(book.last_updated).toLocaleDateString()}</p>
                                    <p><strong>Тільки для дорослих:</strong> {book.adult_content ? 'Так' : 'Ні'}</p>

                                    <div>
                                        <h4>Теги:</h4>
                                        <ul>
                                            {book.tags.map((tag) => (
                                                <li key={tag.id}>{tag.name}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4>Жанри:</h4>
                                        <ul>
                                            {book.genres.map((genre) => (
                                                <li key={genre.id}>{genre.name}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4>Фандоми:</h4>
                                        <ul>
                                            {book.fandoms.map((fandom) => (
                                                <li key={fandom.id}>{fandom.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <hr/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </Container>
        </section>
    );
}

export default SearchPage;
