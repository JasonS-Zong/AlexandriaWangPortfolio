/* Center the rotating animated GIF background, including on mobile Safari.
   Animated <img> elements are more reliable than CSS fixed GIF backgrounds on phones.
   Source GIFs:
   https://giphy.com/gifs/ENwc0woCk0wGh24WXu
   https://giphy.com/gifs/cdRD60pvOTBjhA5tpM
   https://giphy.com/gifs/NoS0sJa6AolT2s4WJq
   https://giphy.com/gifs/hIMPff7CLI0ZZdh0Aq
*/
(() => {
  const backgrounds = [
    "https://media.giphy.com/media/ENwc0woCk0wGh24WXu/giphy.gif",
    "https://media.giphy.com/media/cdRD60pvOTBjhA5tpM/giphy.gif",
    "https://media.giphy.com/media/NoS0sJa6AolT2s4WJq/giphy.gif",
    "https://media.giphy.com/media/hIMPff7CLI0ZZdh0Aq/giphy.gif"
  ];
  const intervalMs = 9000;

  function startBackgroundCycle() {
    if (!document.body || document.querySelector(".portfolio-gif-backdrop")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "portfolio-gif-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    const gif = document.createElement("img");
    gif.alt = "";
    gif.src = backgrounds[0];
    backdrop.appendChild(gif);
    document.body.prepend(backdrop);

    // Hide the CSS background only after the mobile-friendly GIF layer exists.
    document.documentElement.classList.add("portfolio-gif-active");

    let current = 0;
    function preloadNext() {
      const preload = new Image();
      preload.src = backgrounds[(current + 1) % backgrounds.length];
    }
    preloadNext();

    window.setInterval(() => {
      current = (current + 1) % backgrounds.length;
      gif.src = backgrounds[current];
      preloadNext();
    }, intervalMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startBackgroundCycle, { once: true });
  } else {
    startBackgroundCycle();
  }
})();
