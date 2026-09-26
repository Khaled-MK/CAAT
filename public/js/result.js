"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const savePlayerForm = document.getElementById("player-form");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const scoreRaw = sessionStorage.getItem("last_score");
    const totalRaw = sessionStorage.getItem("total_questions");
    if (scoreRaw === null || totalRaw === null) {
        window.location.href = "quiz.html";
        return;
    }
    const userScore = parseInt(scoreRaw, 10);
    const totalQuestions = parseInt(totalRaw, 10);
    const isPerfect = userScore === totalQuestions;
    const resultTitle = document.getElementById("result-title");
    const resultIcon = document.getElementById("result-icon");
    const scoreDisplay = document.getElementById("score-display");
    const rewardContainer = document.getElementById("reward-container");
    if (scoreDisplay) {
        scoreDisplay.textContent = `${userScore} / ${totalQuestions}`;
    }
    if (rewardContainer) {
        if (isPerfect) {
            if (resultTitle)
                resultTitle.textContent = "FÉLICITATIONS !";
            if (resultIcon)
                resultIcon.textContent = "🏆";
            let promoCode = "CAAT100";
            try {
                const response = yield fetch("/api/claim-reward", { method: "POST" });
                if (response.ok) {
                    const data = yield response.json();
                    if (data.code)
                        promoCode = data.code;
                }
            }
            catch (error) {
                console.warn("API indisponible, code par défaut appliqué.");
            }
            rewardContainer.className = "reward-box";
            rewardContainer.innerHTML = `
            <div class="reward-msg">Vous avez remporté l'épreuve !</div>
            <div class="reward-label">Présentez ce code au stand pour récupérer votre lot :</div>
            <div class="code-badge">${promoCode}</div>
         `;
        }
        else {
            if (resultTitle)
                resultTitle.textContent = "DOMMAGE !";
            if (resultIcon)
                resultIcon.textContent = "⚡";
            rewardContainer.className = "reward-box loss-box";
            rewardContainer.innerHTML = `
            <div class="reward-msg">Score insuffisant pour débloquer le lot.</div>
            <div class="reward-label">Un sans-faute (${totalQuestions}/${totalQuestions}) est requis pour gagner. Tentez à nouveau votre chance !</div>
         `;
        }
    }
}));
savePlayerForm.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const answersRaw = sessionStorage.getItem("user_answers");
    if (!answersRaw) {
        console.warn("Réponses introuvables, enregistrement annulé.");
        return;
    }
    const name = document.getElementById("firstname").value;
    const phone = document.getElementById("phone").value;
    const score = Number(sessionStorage.getItem("last_score"));
    const total = Number(sessionStorage.getItem("total_questions"));
    const data = {
        firstname: name,
        phone: phone,
        score,
        total,
        answers: JSON.parse(answersRaw),
    };
    try {
        yield fetch("/api/save-answers", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        console.warn("API indisponible, code par défaut appliqué.");
    }
    console.log("enregistrée dans la bdd");
    window.location.href = "index.html";
}));
