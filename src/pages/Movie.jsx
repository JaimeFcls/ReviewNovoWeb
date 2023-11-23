import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../components/getUser";
import "./Movie.css";

const moviesURL = import.meta.env.VITE_API;
const defaultImageURL = './imagempadrao.png';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const user = getUser();

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const comment = event.target.elements.comment.value;
    const response = await fetch('http://localhost:8082/api/comentar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comentar: comment,
        usuarioId: user.id, 
        movieId: id, 
        
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setComments([...comments, data]);
    } else {
      console.error('Erro ao enviar comentário:', response.statusText);
    }
    event.target.reset();
  };

  const getMovie = async (url) => {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3OTFjM2JmZTU5NmZjMmJiMmQ1OWQwZDhiYWZlMTM2NyIsInN1YiI6IjY0ZGVhYjcyYjc3ZDRiMTEzZmM2MDVhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BwanTcyFlIRs3zxrfDXVXOCt6Cj2bH9AZSyUsNQgAv8',
      },
    });
    const data = await res.json();
    if (!data.poster_path) {
      data.poster_path = defaultImageURL;
    }
    console.log(data);
    setMovie(data);

    const commentsRes = await fetch(`http://localhost:8082/api/comentar/filme/${id}`);
    const commentsData = await commentsRes.json();
    setComments(commentsData);
  };

  useEffect(() => {
    const movieUrl = `${moviesURL}${id}?language=pt-br`;
    getMovie(movieUrl);
  }, []);
  return (
    <div className="movie-back">
      <img src={`https://image.tmdb.org/t/p/w500${movie?.backdrop_path}`} alt="movie backdrop" style={{ width: '1920px', height: '400px', opacity: "20%" }} />
      {movie && (
        <>
          <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`} alt="movie poster" />
          <p className="movie-title">{movie.title}</p>
          <p className="tagline">{movie.tagline}</p>
          <div className="sinopse">
            <h3>
              Sinopse
            </h3>
            <p>{movie.overview}</p>
            <br></br>
            <p>Lançado em : {new Date(movie.release_date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="comments">
          <h3>Comentar</h3>
          <br></br>
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <textarea className="comentario" name="comment" type="text" placeholder="Adicione um comentário..." required />
                <button className="comentar" type="submit">Enviar</button>
              </form>
            ) : (
                <p>Você precisa estar logado para comentar.  <a className="clique" href="/login">Clique aqui para entrar</a></p>
              
            )}
            {comments.map((comment, index) => (
              <p className="falaai" key={index}>{comment.comentar} - {comment.usuario ? comment.usuario.nome : 'Usuário desconhecido'} </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Movie;
