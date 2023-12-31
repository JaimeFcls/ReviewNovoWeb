import { useEffect, useState } from "react";
import { FaEdit, FaRegHeart, FaReply } from "react-icons/fa";
import { FaHeart, FaRegTrashCan } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { getUser } from "../components/getUser";



import "./Movie.css";

const moviesURL = import.meta.env.VITE_API;
const defaultImageURL = './imagempadrao.png';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [listaId, setListaId] = useState(null); 

  const handleReplyClick = (commentId) => {
    if (replyingTo === commentId) {
      setReplyingTo(null); 
    } else {
      setReplyingTo(commentId); 
    }
  };

  const user = getUser();

  const handleCommentChange = (event) => {
    const text = event.target.value;
    if (text.length <= 1500) {
      setCommentText(text);
      setCharCount(text.length);
    }
  };


  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('https://do6lwa1u9mxs.share.zrok.io/api/comentar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comentar: commentText,
        usuarioId: user.id,
        movieId: id,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setComments([...comments, data]);
      setCommentText("");
      setCharCount(0);
    } else {
      console.error('Erro ao enviar comentário:', response.statusText);
    }
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

    const commentsRes = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/comentar/filme/${id}`);
    const commentsData = await commentsRes.json();
    setComments(commentsData);
  };
  const handleCommentDelete = async (commentId) => {
    if (window.confirm('Tem certeza de que deseja excluir este comentário? As respostas obtidas também serão excluidas')) {
      
      const repliesToDelete = replies.filter(reply => reply.comentario?.id === commentId);
      for (let reply of repliesToDelete) {
        await handleReplyDelete(reply.id);
      }
      const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/comentar/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        console.error('Erro ao excluir comentário:', response.statusText);
      }
    }
  };
  const handleReplyChange = (event) => {
    const text = event.target.value;
    if (text.length <= 1500) {
      setReplyText(text);
    }
  };
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingCommentId) {
      console.error('Erro: editingCommentId é undefined');
      return;
    }
    const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/comentar/${editingCommentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comentar: editingText,
        usuarioId: user.id,
        movieId: id,
      }),
    });
    if (response.ok) {
      window.location.reload();
      const data = await response.json();
      setComments(comments.map(comment => comment.id === editingCommentId ? data : comment));
      setEditingCommentId(null);
      setEditingText("");

    } else {
      console.error('Erro ao editar comentário:', response.statusText);
    }
  };
  const handleReplyEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingReplyId) {
      console.error('Erro: editingReplyId é undefined');
      return;
    }
    const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/respostas/${editingReplyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuarioId: user.id,
        comentarioId: editingReply.comentario.id,
        movieId: editingReply.movieId,
        serieId: editingReply.serieId,
        texto: editingReplyText,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      getReplies(); 
      setReplies(replies.map(reply => reply.id === editingReplyId ? data : reply));
      window.location.reload();
    } else {
      console.error('Erro ao editar resposta:', response.statusText);
    }
  };
  const handleReplySubmit = async (event, commentId) => {
    event.preventDefault();
    const response = await fetch('https://do6lwa1u9mxs.share.zrok.io/api/respostas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texto: replyText,
        usuarioId: user.id,
        comentarioId: commentId,
      }),
    });
    if (response.ok) {
      getReplies(); 
      const data = await response.json();
      setReplies([...replies, data]);
      setReplyText("");
      setReplyingTo(null); 
    } else {
      console.error('Erro ao enviar resposta:', response.statusText);
    }
  };
  const getReplies = async () => {
    try {
      const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/respostas`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setReplies(data);
      } else {
        console.error('Erro ao recuperar respostas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao recuperar respostas:', error);
    }
  };

  const handleReplyDelete = async (replyId) => {
    const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/respostas/${replyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      getReplies();
      setReplies(replies.filter(reply => reply.id !== replyId));
    } else {
      console.error('Erro ao excluir resposta:', response.statusText);
    }
  };
  const addToFavorites = async (movieId, usuarioId) => {
    try {
      if (!movieId || !usuarioId) {
        console.error('Erro: ID do filme ou ID do usuário não fornecido');
        return;
      }
  
      const response = await fetch('https://do6lwa1u9mxs.share.zrok.io/api/lista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId.toString(),
          usuarioId: usuarioId.toString(),
        }),
      });
  
      if (response.ok) {
        
        const data = await response.json();
        alert('Filme adicionado aos favoritos!');
        window.location.reload();

      } else {
        console.error('Erro ao adicionar aos favoritos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
    }
  };
  const checkFavorite = async (movieId, usuarioId) => {
    try {
      const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/lista`);
      if (response.ok) {
        const data = await response.json();
        return data.some(movie => movie.movieId === movieId && movie.usuario.id === usuarioId);
      } else {
        console.error('Erro ao verificar favoritos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
    return false;
  };
  const getListaId = async (movieId, usuarioId) => {
    try {
      const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/lista`);
      if (response.ok) {
        const data = await response.json();
        const favorite = data.find(movie => movie.movieId === movieId && movie.usuario.id === usuarioId);
        return favorite ? favorite.id : null;
      } else {
        console.error('Erro ao obter o ID da lista:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao obter o ID da lista:', error);
    }
    return null;
  };
  const removeFromFavorites = async (listaId) => {
    try {
      if (!listaId) {
        console.error('Erro: ID da lista não fornecido');
        return;
      }

      const response = await fetch(`https://do6lwa1u9mxs.share.zrok.io/api/lista/${listaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Filme removido dos favoritos!');
        window.location.reload();
      } else {
        console.error('Erro ao remover dos favoritos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    }
  };
  
  useEffect(() => {
    const user = getUser();
    if (user && user.id) {
      checkFavorite(id, user.id).then(setIsFavorite);
      getListaId(id, user.id).then(setListaId);
    }
    
    const movieUrl = `${moviesURL}${id}?language=pt-br`;
    getMovie(movieUrl);
    getReplies();
    console.log(editingCommentId);
  }, [id, editingCommentId]);
  return (
    <div className="movie-back">
      <img src={`https://image.tmdb.org/t/p/w500${movie?.backdrop_path}`} alt="movie backdrop" style={{ width: '1920px', height: '400px', opacity: "20%" }} />
      {movie && (
        <>
          <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`} alt="movie poster" />
          
          <p className="movie-title">{movie.title}</p>
          <p className="tagline">{movie.tagline}</p>
          
          <div className="sinopse">
            <h3>Sinopse</h3>
            <p>{movie.overview}</p>
            <br />
            <p>Lançado em: {new Date(movie.release_date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="fav">
            {isFavorite ? <FaHeart style={{ width: '30px', height: '30px', color: ' #037cd8', cursor: 'pointer' }} onClick={() => removeFromFavorites(listaId)} /> : <FaRegHeart style={{ width: '30px', height: '30px', color: ' #037cd8', cursor: 'pointer' }} onClick={() => addToFavorites(movie.id, user.id)} />}
          </div>
          <div className="comments">
            <h3>Comentar</h3>
            <br />
            {user ? (
              <div>
              
              <form onSubmit={(event) => editingCommentId ? handleEditSubmit(event, editingCommentId) : handleCommentSubmit(event)}>
                <textarea
                  className="comentario"
                  name="comment"
                  type="text"
                  placeholder="Adicione um comentário..."
                  value={editingCommentId ? editingText : commentText}
                  onChange={editingCommentId ? (event) => setEditingText(event.target.value) : handleCommentChange}
                  required
                />
                <div className="char-count">Caracteres restantes: {1500 - charCount}</div>
                <button className="comentar" type="submit">{editingCommentId ? "Editar" : "Enviar"}</button>
              </form>
              </div>
            ) : (
              <p>Você precisa estar logado para comentar. <a className="clique" href="/login">Clique aqui para entrar</a></p>
            )}
            <div>
              <p className="cmt">Comentarios :</p>
            </div>

            {comments.map((comment, index) => (
              <div className="ComentarioFinal" key={index}>
                <p className="falaai">{comment.comentar}</p>
                <p className="nomeComment"> - {comment.usuario.nome}</p>
                {user && user.id === comment.usuario.id && (
                  <div>
                    <div className="lixeira" onClick={() => handleCommentDelete(comment.id)}>
                      <FaRegTrashCan />
                    </div>
                    <div className="Editar" onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.comentar); }}>
                      <FaEdit />
                    </div>
                  </div>
                )}
                <div className="resposta" onClick={() => handleReplyClick(comment.id)}>
                  <FaReply />
                </div>
                {user ? (
                  replyingTo === comment.id || editingReplyId ? (
                    <form onSubmit={(event) => editingReplyId ? handleReplyEditSubmit(event, editingReply.id) : handleReplySubmit(event, comment.id)}>
                      <div>
                        <h6 className="titleRespostas">Responder :</h6>
                      </div>
                      <textarea className="comentarioResposta" value={editingReplyId ? editingReplyText : replyText} onChange={editingReplyId ? (event) => setEditingReplyText(event.target.value) : handleReplyChange} />
                      <button className="enviarResposta" type="submit">{editingReplyId ? "Salvar" : "Enviar"}</button>
                    </form>
                  ) : null
                ) : (
                  <p>Você precisa estar logado para responder. <a className="clique" href="/login">Clique aqui para entrar</a></p>
                )}

                <div>
                  <h6 className="titleRespostas">Respostas :</h6>
                </div>
                {replies
                  .filter(reply => reply.comentario?.id === comment?.id)
                  .map((reply, index) => (
                    <div className="RespostaFinal" key={index}>
                      <p className="falaai2">{reply.texto}</p>
                      <p className="nomeReply"> - {reply.usuario.nome}</p>
                      {user && reply?.usuario && (user.id === reply.usuario.id) && (
                        <div>
                        <div>
                        </div>
                        <div className="lixeira2" onClick={() => handleReplyDelete(reply.id)}>
                          <FaRegTrashCan />
                        </div>
                          <div className="Editar2" onClick={() => { setEditingReplyId(reply.id); setEditingReply(reply); setEditingReplyText(reply.texto); }}>
                            <FaEdit />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Movie;