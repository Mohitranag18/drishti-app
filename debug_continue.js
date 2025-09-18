// Debug script to test continue session
const testSessionData = {
  session: {
    id: "test123",
    userInput: "I'm feeling stressed about work",
    quizzes: [
      {
        id: "q1",
        question: "How are you feeling about this situation?",
        type: "text",
        placeholder: "Please share your thoughts..."
      },
      {
        id: "q2", 
        question: "What's your main concern?",
        type: "multiple_choice",
        options: ["Workload", "Deadlines", "Colleagues", "Management"]
      }
    ],
    quizAnswers: {
      "q1": "I'm really overwhelmed",
      "q2": "Workload"
    }
  }
};

console.log("Test session data structure:");
console.log("Quizzes:", testSessionData.session.quizzes);
console.log("Quiz answers:", testSessionData.session.quizAnswers);
