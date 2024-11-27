let form = document.querySelector("form")
let categoryInput = document.querySelector("#categoryMenu")
let difficultInput = document.querySelector("#difficultyOptions")
let numberInput = document.querySelector("#questionsNumber")
let typeInput = document.querySelector("#typeOptions")
let startButton = document.querySelector("button")
let questionRow = document.querySelector(".questions .container .row")
let quiz;
let allQuestions;

startButton.addEventListener('click', async function(){
    let category = categoryInput.value
    let difficult = difficultInput.value
    let number = numberInput.value
    let type = typeInput.value

    if(number>0){
      quiz = new Quiz(category, difficult, number, type)
      allQuestions = await quiz.getQuestions()
      form.classList.replace('d-flex', 'd-none')
      let question = new Question(0)
      question.display()
    }
    else{
      numberInput.classList.add('is-invalid')
    }    
})

class Quiz{
    constructor(category, difficult, number, type){
        this.category = category
        this.difficult = difficult
        this.number = number 
        this.type = type
        this.score = 0
    }

    async getQuestions() {
        let response = await fetch(`https://opentdb.com/api.php?amount=${this.number}&category=${this.category}&difficulty=${this.difficult}&type=${this.type}`)
        let data = await response.json()
        return data.results
    }

    finalResult(){
      return `
      <div
        class="question shadow-lg col-lg-12  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3"
      >
        <h2 class="mb-0">
        ${
          this.score == this.number? `Congratulations 🎉 <br/> Your score is ${this.score}/${allQuestions.length}` : `Your score is ${this.score}/${allQuestions.length}`
        }      
        </h2>
        <button class="again btn btn-primary rounded-pill"><i class="bi bi-arrow-repeat"></i> Try Again</button>
      </div>
    `;
    }
}

class Question{
    constructor(index){
        this.index = index
        this.category = allQuestions[index].category
        this.correct_answer = allQuestions[index].correct_answer
        this.difficulty = allQuestions[index].difficulty
        this.incorrect_answers = allQuestions[index].incorrect_answers
        this.question = allQuestions[index].question
        this.type = allQuestions[index].type
        this.allAnswers = this.getAllAnswers()
        this.answered = false 
    }

    getAllAnswers(){
        let allAnswers = [...this.incorrect_answers, this.correct_answer]
        allAnswers.sort()
        return allAnswers
    }

    display() {
        const question = `
      <div
        class="question shadow-lg col-lg-6 offset-lg-3  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn"
      >
        <div class="w-100 d-flex justify-content-between">
          <span class="btn btn-category">${this.category}</span>
          <span class="fs-6 btn btn-questions"> ${this.index + 1} of ${allQuestions.length} Questions</span>
        </div>
        <h2 class="text-capitalize h4 text-center">${this.question}</h2>  
        <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
          ${this.allAnswers.map((li) => `<li>${li}</li>`).toString().replaceAll(',', '')}
        </ul>
        <h2 class="text-capitalize text-center score-color h3 fw-bold"><i class="bi bi-emoji-laughing"></i> Score: ${quiz.score}</h2>        
      </div>
    `;
        questionRow.innerHTML = question;

        let allChoices = document.querySelectorAll('.choices li')
        allChoices.forEach((li) => {
          li.addEventListener('click', () => {
            this.checkAnswer(li)
            allChoices.forEach((li) => {
              if(li.innerHTML == this.correct_answer){
                li.classList.add('correct')
              }
            })
            this.nextQuestion()
          })
        })
      }

      checkAnswer(li){
        if(this.answered == false){
          this.answered = true
          if(li.innerHTML == this.correct_answer){
            li.classList.add('correct', 'animate__animated', 'animate__bounce')
            quiz.score++
          }
          else{
            li.classList.add('wrong', 'animate__animated', 'animate__shakeX')
          }
        }
      }

      nextQuestion(){
        this.index ++
        setTimeout(() => {
        if(this.index < allQuestions.length){
          let nextQuestion = new Question(this.index)
          nextQuestion.display()
        }
        else{
          let result = quiz.finalResult()
          questionRow.innerHTML = result
          document.querySelector('.again').addEventListener('click', function(){
            window.location.reload()
          })
        }
        }, 1500)
      }
}