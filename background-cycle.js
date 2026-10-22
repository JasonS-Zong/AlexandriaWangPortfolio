/* Cycle through the four GIPHY backgrounds every nine seconds, indefinitely.
   Source GIFs: https://giphy.com/gifs/ENwc0woCk0wGh24WXu, https://giphy.com/gifs/cdRD60pvOTBjhA5tpM, https://giphy.com/gifs/NoS0sJa6AolT2s4WJq, https://giphy.com/gifs/hIMPff7CLI0ZZdh0Aq */
(() => {
  const backgrounds = [
    "https://media.giphy.com/media/ENwc0woCk0wGh24WXu/giphy.gif",
    "https://media.giphy.com/media/cdRD60pvOTBjhA5tpM/giphy.gif",
    "https://media.giphy.com/media/NoS0sJa6AolT2s4WJq/giphy.gif",
    "https://media.giphy.com/media/hIMPff7CLI0ZZdh0Aq/giphy.gif"
  ];
  const intervalMs = 9000;

  function startBackgroundCycle() {
    let current = 0;

    function preloadNext() {
      const upcoming = (current + 1) % backgrounds.length;
      const preload = new Image();
      preload.src = backgrounds[upcoming];
    }

    preloadNext();
    window.setInterval(() => {
      current = (current + 1) % backgrounds.length;
      document.body.style.backgroundImage = 'linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url("' + backgrounds[current] + '")';
      preloadNext();
    }, intervalMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startBackgroundCycle, { once: true });
  } else {
    startBackgroundCycle();
  }
})();
