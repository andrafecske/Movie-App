import React, {useEffect, useState} from 'react'
import Search from "./assets/components/Search.jsx";
import Spinner from "./assets/components/Spinner.jsx";
import MovieCard from "./assets/components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appWrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3/discover/movie";
const SEARCH_API_URL = "https://api.themoviedb.org/3/search/movie";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}
const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [trendingMovies, setTrendingMovies] = useState([]);
    const fetchMovies = async(query = '') =>{
        try{
            setIsLoading(true)
            const endpoint =  query
                ?`${SEARCH_API_URL}?query=${encodeURIComponent(query)}`
                :`${API_BASE_URL}?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok)
            {throw new Error('bad response')}

            const data = await response.json();

            console.log(data);

            if (data.Response === 'False'){
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);

            if(query && data.results.length> 0){
                await updateSearchCount(query, data.results[0]);
            }
        } catch(error)
        { console.error(`Error fetching movies: ${error}`);
          setErrorMessage('Error fetching movies')
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchTrendingMovies();
    }, []);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

    const fetchTrendingMovies = async () => {
        try{

            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        }
        catch(error)
        { console.error(`Error fetching trending movies: ${error}`);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>

    )
}
export default App
