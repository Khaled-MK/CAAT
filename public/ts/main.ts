/** @format */

const trigger = document.getElementById("trigger") as HTMLDivElement;

let count = 0;

trigger.addEventListener("click", () => {
   count++;
   console.log(`Trigger clicked ${count} times`);
   if (count >= 3) {
      window.location.href = "admin.html";
   }
});
