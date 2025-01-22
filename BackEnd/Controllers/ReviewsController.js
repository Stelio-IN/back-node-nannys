import { Sequelize } from "sequelize";
import db from "../Models/index.js";  // Importando os modelos, incluindo Reviews
const { Op } = Sequelize;
const Reviews = db.Reviews;

const createReview = async (req, res) => {
  try {
    const review = await Reviews.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Reviews.findByPk(req.params.review_id);
    if (review) {
      res.status(200).json(review);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Reviews.findAll({
      where: { reviewee_id: req.params.user_id },
    });
    if (reviews.length > 0) {
      res.status(200).json(reviews);
    } else {
      res.status(404).json({ message: "No reviews found for this user" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const [updated] = await Reviews.update(req.body, {
      where: { review_id: req.params.review_id },
    });
    if (updated) {
      const updatedReview = await Reviews.findByPk(req.params.review_id);
      res.status(200).json(updatedReview);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const deleted = await Reviews.destroy({
      where: { review_id: req.params.review_id },
    });
    if (deleted) {
      res.status(204).json({ message: "Review deleted" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateAverageRating = async (req, res) => {
  try {
    const revieweeId = req.params.user_id;

    // Calcular a média das avaliações usando uma consulta personalizada
    const result = await Reviews.findOne({
      attributes: [
        [Sequelize.fn('avg', Sequelize.col('rating')), 'averageRating'],
      ],
      where: { reviewee_id: revieweeId },
    });

    // Verificando o resultado da consulta
    console.log("Result:", result);

    // Verifica se o resultado retornou e converte a média para número
    if (!result || result.dataValues.averageRating === null) {
      return res.status(404).json({ message: "No reviews found for this user" });
    }

    const averageRating = parseFloat(result.dataValues.averageRating); // Garantir que seja um número

    // Verificando se o valor é um número válido
    if (isNaN(averageRating)) {
      return res.status(404).json({ message: "Unable to calculate average rating" });
    }

    // Retorna a média das avaliações
    res.status(200).json({ averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getAllComments = async (req, res) => {
  try {
    const revieweeId = req.params.user_id;

    // Buscando os comentários de um usuário específico (reviewee_id)
    const comments = await Reviews.findAll({
      where: { reviewee_id: revieweeId },
      attributes: ['review_text', 'rating'], // Pega o texto da revisão e a nota
    });

    if (comments.length === 0) {
      return res.status(404).json({ message: "No comments found for this user" });
    }

    // Calcular a média das avaliações manualmente
    const ratings = comments.map(comment => parseFloat(comment.rating)); 
    const totalRatings = ratings.reduce((sum, rating) => sum + rating, 0); 
    const averageRating = (ratings.length > 0) ? (totalRatings / ratings.length).toFixed(2) : null;

    // Retornando os comentários e a média das avaliações
    res.status(200).json({
      comments,
      averageRating: averageRating || 'No Rating', 
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Caso ocorra algum erro
  }
};


const getAllCommfents = async (req, res) => {
  try {
    const revieweeId = req.params.user_id;

    // Buscando os comentários de um usuário específico (reviewee_id)
    const comments = await Reviews.findAll({
      where: { reviewee_id: revieweeId },
      attributes: ['review_text', 'rating'], // Pega o texto da revisão e a nota
    });
    
    if (comments.length === 0) {
      return res.status(404).json({ message: "No comments found for this user" });
    }

    // Calculando a média das avaliações
    const averageRatingResult = await Reviews.findOne({
      attributes: [
        [Sequelize.fn('avg', Sequelize.col('rating')), 'averageRating'],
      ],
      where: { reviewee_id: revieweeId },
    });

    const averageRating = averageRatingResult && averageRatingResult.averageRating ? parseFloat(averageRatingResult.averageRating).toFixed(2) : null;

    // Retornando os comentários e a média das avaliações
    res.status(200).json({
      comments,
      averageRating: averageRating || 'No Rating', // Caso a média seja null
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Caso ocorra algum erro
  }
};


export default {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByUser,
  updateReview,
  deleteReview,
  calculateAverageRating,
  getAllComments,
};
