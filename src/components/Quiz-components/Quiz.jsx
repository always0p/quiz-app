import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import "./Quiz.css";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [shuffledAnswers, setShuffledAnswers] = useState([]); // Store shuffled answers
  const [isAnswered, setIsAnswered] = useState(false); // Track if the current question has been answered

  const navigate = useNavigate();

  useEffect(() => {
    const cachedQuestions = localStorage.getItem("triviaQuestions");
    const cacheTimestamp = localStorage.getItem("triviaQuestionsTimestamp");

    const cacheExpiry = 3600000; // Cache expiration set to 1 hour

    if (cachedQuestions && cacheTimestamp && (Date.now() - cacheTimestamp) < cacheExpiry) {
      console.log("Using cached questions");
      setQuestions(JSON.parse(cachedQuestions));
      setLoading(false);
    } else {
      console.log("Cache expired or not available, fetching new questions");
      fetchQuestions();
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      shuffleAnswers(); // Shuffle answers when a new question is loaded
      setIsAnswered(false); // Reset the answered state for the new question
    }
  }, [currentQuestionIndex, questions]); // Run when the question index or questions change

  const fetchQuestions = async (retryCount = 0) => {
    try {
      console.log(`Fetching questions, attempt ${retryCount + 1}`);
      const response = await fetch(
        "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple"
      );

      if (response.status === 429 && retryCount < 5) {
        console.warn("Rate limited, retrying...");
        const retryAfter = parseInt(response.headers.get("Retry-After")) || 3;
        await new Promise((res) => setTimeout(res, retryAfter * 1000));
        return fetchQuestions(retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched new questions successfully:", data);

      localStorage.setItem("triviaQuestions", JSON.stringify(data.results));
      localStorage.setItem("triviaQuestionsTimestamp", Date.now());
      setQuestions(data.results);
    } catch (error) {
      console.error("Failed to fetch trivia questions", error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleAnswers = () => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
      setShuffledAnswers(answers.sort(() => Math.random() - 0.5)); // Shuffle answers once
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (questions.length === 0) {
    return <div>No questions available</div>;
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const checkAnswer = (selectedAnswer) => {
    if (isAnswered) return; // Prevent further scoring if the question has already been answered

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(score + 1); // Increment score for correct answer
    }

    setSelectedAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = selectedAnswer;
      return updatedAnswers;
    });

    setIsAnswered(true); // Mark the question as answered
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(selectedAnswers)], { type: "application/json" });
    saveAs(blob, "selectedAnswers.json");
    alert("Answers saved to file!");
  };

  const handleSubmit = () => {
    localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
    localStorage.setItem("score", score);
    navigate("/result");
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className='container'>
      <h1>Quiz-app</h1>
      <hr />
      <h2 dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></h2>
      <ul>
        {shuffledAnswers.map((answer, index) => (
          <li
            key={index}
            onClick={() => checkAnswer(answer)}
            className={`answer-option ${isAnswered ? "disabled" : ""}`} // Disable answer options after selection
          >
            {answer}
          </li>
        ))}
      </ul>

      <div className='buttons-container'>
        <button onClick={handleBack} disabled={currentQuestionIndex === 0}>Back</button>
        <button onClick={handleSave}>Save</button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>

      <div className='question-index'>
        {currentQuestionIndex + 1} of {questions.length}
      </div>
    </div>
  );
}

export default Quiz;
