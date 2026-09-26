/** @format */

// Structure d'une réponse utilisateur
interface UserAnswer {
   question_id: number;
   selected_index: number; // Index choisi (0, 1, 2) ou -1 si timeout
}

const savePlayerForm = document.getElementById("player-form") as HTMLFormElement;

document.addEventListener("DOMContentLoaded", async () => {
   // Récupération du score stocké dans le sessionStorage
   const scoreRaw = sessionStorage.getItem("last_score");
   const totalRaw = sessionStorage.getItem("total_questions");

   // Redirection si l'utilisateur accède à la page sans avoir joué
   if (scoreRaw === null || totalRaw === null) {
      window.location.href = "quiz.html";
      return;
   }

   const userScore = parseInt(scoreRaw, 10);
   const totalQuestions = parseInt(totalRaw, 10);
   const isPerfect = userScore === totalQuestions;

   // Récupération des éléments du DOM
   const resultTitle = document.getElementById("result-title");
   const resultIcon = document.getElementById("result-icon");
   const scoreDisplay = document.getElementById("score-display");
   const rewardContainer = document.getElementById("reward-container");

   if (scoreDisplay) {
      scoreDisplay.textContent = `${userScore} / ${totalQuestions}`;
   }

   if (rewardContainer) {
      if (isPerfect) {
         if (resultTitle) resultTitle.textContent = "FÉLICITATIONS !";
         if (resultIcon) resultIcon.textContent = "🏆";

         // Récupération/génération du code promo via l'API
         let promoCode = "CAAT100";
         try {
            const response = await fetch("/api/claim-reward", { method: "POST" });
            if (response.ok) {
               const data = await response.json();
               if (data.code) promoCode = data.code;
            }
         } catch (error) {
            console.warn("API indisponible, code par défaut appliqué.");
         }

         rewardContainer.className = "reward-box";
         rewardContainer.innerHTML = `
            <div class="reward-msg">Vous avez remporté l'épreuve !</div>
            <div class="reward-label">Présentez ce code au stand pour récupérer votre lot :</div>
            <div class="code-badge">${promoCode}</div>
         `;
      } else {
         if (resultTitle) resultTitle.textContent = "DOMMAGE !";
         if (resultIcon) resultIcon.textContent = "⚡";

         rewardContainer.className = "reward-box loss-box";
         rewardContainer.innerHTML = `
            <div class="reward-msg">Score insuffisant pour débloquer le lot.</div>
            <div class="reward-label">Un sans-faute (${totalQuestions}/${totalQuestions}) est requis pour gagner. Tentez à nouveau votre chance !</div>
         `;
      }
   }
});

// Dans la fonction handleAnswer() de quiz.ts :
// function handleAnswer(selectedIndex: number, selectedBtn: HTMLButtonElement): void {
//    clearInterval(timerInterval);
//    const q = selectedQuestions[currentQuestionIndex];

//    // Enregistrer la réponse
//    userAnswersHistory.push({
//       question_id: q.id,
//       selected_index: selectedIndex,
//    });

//    // ... reste de la logique handleAnswer ...
// }

// Dans la fonction handleTimeout() de quiz.ts :
// function handleTimeout(): void {
//    const q = selectedQuestions[currentQuestionIndex];

//    // Enregistrer le dépassement de temps (-1)
//    userAnswersHistory.push({
//       question_id: q.id,
//       selected_index: -1,
//    });

//    // ... reste de la logique handleTimeout ...
// }

// Dans finishQuiz() de quiz.ts :
// function finishQuiz(): void {
//    clearInterval(timerInterval);
//    sessionStorage.setItem("last_score", userScore.toString());
//    sessionStorage.setItem("total_questions", selectedQuestions.length.toString());
//    sessionStorage.setItem("user_answers", JSON.stringify(userAnswersHistory));

//    window.location.href = "result.html";
// }
// console.log(JSON.parse(sessionStorage.getItem("user_answers")));
savePlayerForm.addEventListener("submit", async (event) => {
   event.preventDefault();
   const answersRaw = sessionStorage.getItem("user_answers");
   if (!answersRaw) {
      console.warn("Réponses introuvables, enregistrement annulé.");
      return;
   }

   const name = (document.getElementById("firstname") as HTMLInputElement).value;
   const phone = (document.getElementById("phone") as HTMLInputElement).value;
   const score = Number(sessionStorage.getItem("last_score"));
   const total = Number(sessionStorage.getItem("total_questions"));

   const data = {
      firstname: name,
      phone: phone,
      score,
      total,
      answers: JSON.parse(answersRaw) as UserAnswer[],
   };

   try {
      await fetch("/api/save-answers", {
         method: "POST",
         body: JSON.stringify(data),
         headers: {
            "Content-Type": "application/json",
         },
      });
   } catch (error) {
      console.warn("API indisponible, code par défaut appliqué.");
   }

   console.log("enregistrée dans la bdd");

   window.location.href = "index.html";
});
