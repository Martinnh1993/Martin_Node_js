const lines = [
  "Server-side rendering (SSR) is a popular technique for rendering a normally client-side-only single-page app (SPA) on the server and then sending a fully rendered page to the client.",
  "The client’s JavaScript bundle can then take over, and the SPA can operate as normal.",
  "SSR technique is helpful in situations where the client has a slow internet connection, and then rendering the whole page on the client-side takes too much time.",
  "In certain situations, Server Side Rendering might come in handy.",
];
const speed = 50;

let charIndex = 0;

function typeWriter() {
  const lineElements = lines.map((_, index) => document.getElementById(`line${index + 1}`));

  function writeCharacter() {
    lineElements.forEach((element, index) => {
      if (charIndex < lines[index].length) {
        element.textContent += lines[index].charAt(charIndex);
      }
    });

    charIndex++;

    if (charIndex < lines[0].length) {
      setTimeout(writeCharacter, speed);
    }
  }

  setTimeout(writeCharacter, speed);
}

function startTypewriter(button) {
  button.style.display = "none";
  typeWriter();
  document.getElementById("reference").style.display = "block";
}
