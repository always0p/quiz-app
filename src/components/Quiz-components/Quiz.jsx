import React, { useEffect, useState } from 'react';
import './Quiz.css';

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect

  useEffect(() => {
    fetch('http://localhost:3000/fetch-quiz')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); 
        setQuestions(data);
        //setLoading(false);
      })
      .catch(error => {  
        console.error('Error fetching quiz data:', error);
        //setLoading(false); // Ensure  loadingstate is false even on error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display a loading message while fetching data
  }

  if (questions.length === 0) {
    return <div>No questions available</div>; // Display a message if no questions are loaded
  }

  const currentQuestion = questions[currentQuestionIndex];
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
  return (
    <div className='container'>
      <h1>Quiz-app</h1>
      <hr />
      <h2>{currentQuestion.question}</h2>
      <ul>
        {currentQuestion.incorrect_answers.concat(currentQuestion.correct_answer).map((answer, index) => (
          <li key={index}>{answer}</li>
        ))}
      </ul>
      <button onClick={handleBack} disabled={currentQuestionIndex === 0}>Back</button>
      <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>Next</button>
      <div className='question-index'>
        {currentQuestionIndex + 1} of {questions.length}
      </div>
    </div>
  );
}

export default Quiz;
