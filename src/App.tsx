import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { queryDatabase } from "./sqliteHelper"; // Assuming you have a helper to interact with SQLite

import "react-datepicker/dist/react-datepicker.css";
import "./App.css"; // Include the CSS for styling

// Interface to define the shape of category and question data
interface Category {
  id: number;
  name: string;
}

interface Question {
  id: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  category: string;
  display_date: string;
  created_by: string;
  creation_date: string;
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]); // Category list
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Selected category
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Date or null
  const [questions, setQuestions] = useState<Question[]>([]); // Fetched questions for the selected date
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // Answer selected by the user
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // Whether the answer is correct
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null); // Store the correct answer for the selected question

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date); // Now it can handle both Date and null
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await queryDatabase("SELECT * FROM categories");
      setCategories(result || []);
    };
    fetchCategories();
  }, []);

  // Fetch questions based on category and selected date
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedCategory || !selectedDate) return;

      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
      const query = `
        SELECT 
          q.id, q.question, q.option_1, q.option_2, q.option_3, q.option_4,
          c.name AS category, q.display_date
        FROM quiz_questions q
        JOIN categories c ON q.category_id = c.id
        WHERE q.category_id = ${selectedCategory} AND q.display_date = '${formattedDate}'
      `;
      const result = await queryDatabase(query);
      setQuestions(result || []);
    };

    fetchQuestions();
  }, [selectedCategory, selectedDate]);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(Number(event.target.value));
  };

  const handleSubmitAnswer = async (questionId: number) => {
    // Fetch the correct answer only when the user submits
    const query = `
      SELECT correct_answer 
      FROM quiz_questions 
      WHERE id = ${questionId}
    `;
    const result = await queryDatabase(query);
    if (result && result[0]) {
      setCorrectAnswer(result[0].correct_answer); // Set the correct answer
      const isAnswerCorrect = selectedAnswer === result[0].correct_answer;
      setIsCorrect(isAnswerCorrect); // Check if the user's answer is correct
    }
  };

  return (
    <div className="quiz-container">
      <h1>Quiz App</h1>

      {/* Category Dropdown */}
      <div className="category-selector">
        <label htmlFor="category">Select Category: </label>
        <select
          id="category"
          value={selectedCategory ?? ""}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
        >
          <option value="" disabled>Select a Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Picker */}
      <div className="date-picker">
        <label htmlFor="date">Select Date: </label>
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
        />
      </div>

      {/* Display Questions */}
      <div className="questions-container">
        {questions.length === 0 && selectedCategory && selectedDate ? (
          <p>No questions available for the selected date.</p>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="question-box">
              <p className="question-text">{question.question}</p>

              {/* Display options as radio buttons */}
              {['option_1', 'option_2', 'option_3', 'option_4'].map((option, idx) => (
                <div key={idx} className="option">
                  <input
                    type="radio"
                    id={`${option}-${question.id}`}
                    name={`question-${question.id}`}
                    value={idx + 1}
                    checked={selectedAnswer === idx + 1}
                    onChange={handleAnswerChange}
                  />
                  <label htmlFor={`${option}-${question.id}`}>
                    {question[option as keyof Question]}
                  </label>
                </div>
              ))}

              {/* Submit button */}
              <button
                className="submit-button"
                onClick={() => handleSubmitAnswer(question.id)}
              >
                Submit Answer
              </button>

              {/* Display feedback */}
              {isCorrect !== null && (
                <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? <p>Correct! 🎉</p> : <p>Incorrect. 😞</p>}
                </div>
              )}

              {/* Show correct answer if the answer is wrong */}
              {correctAnswer !== null && selectedAnswer !== null && selectedAnswer !== correctAnswer && (
                <div className="correct-answer">
                  <p>Correct Answer: Option {correctAnswer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
