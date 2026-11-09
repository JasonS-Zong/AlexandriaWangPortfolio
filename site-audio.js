/* Soundtrack: "Chill lofi inspired" by omfgdude, CC0.
   https://opengameart.org/content/chill-lofi-inspired */
document.addEventListener("DOMContentLoaded", () => {
  const enabledKey = "aw-portfolio-music-enabled";
  const positionKey = "aw-portfolio-music-position";
  const audio = document.createElement("audio");
  audio.src = "https://opengameart.org/sites/default/files/ChillLofiR_0.mp3";
  audio.loop = true;
  audio.volume = 0.22;
  audio.autoplay = true;
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");
  document.body.appendChild(audio);

  const widget = document.createElement("div");
  widget.className = "portfolio-music";
  widget.innerHTML = '<button class="portfolio-music-toggle" type="button" aria-label="Play background music" aria-pressed="false">♫ Play music</button><a href="https://opengameart.org/content/chill-lofi-inspired" target="_blank" rel="noopener noreferrer" class="portfolio-music-credit">Lo-fi by omfgdude · CC0</a>';
  document.body.appendChild(widget);

  const button = widget.querySelector("button");
  const active = new Set();
  const players = [];
  let wanted = sessionStorage.getItem(enabledKey) !== "false";
  let blocked = false;

  function savePreference() {
    sessionStorage.setItem(enabledKey, String(wanted));
  }

  function label() {
    if (!wanted) {
      button.textContent = "♫ Play music";
      button.setAttribute("aria-label", "Play background music");
    } else if (active.size) {
      button.textContent = "♫ Paused for video";
      button.setAttribute("aria-label", "Music is paused while a video plays");
    } else if (!audio.paused) {
      button.textContent = "♫ Pause music";
      button.setAttribute("aria-label", "Pause background music");
    } else {
      // If autoplay was blocked, clicking this retries playback instead of
      // accidentally switching the user's music preference off.
      button.textContent = "♫ Play music";
      button.setAttribute("aria-label", "Play background music");
    }
    button.setAttribute("aria-pressed", String(wanted && !active.size && !audio.paused));
  }

  function stop() {
    audio.pause();
    label();
  }

  function resume() {
    if (!wanted || active.size) {
      label();
      return;
    }

    // Reload after a media error so the Play button can retry the soundtrack.
    if (audio.error) audio.load();

    try {
      const attempt = audio.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(() => {
          blocked = false;
          label();
        }).catch(() => {
          blocked = true;
          label();
        });
      } else {
        blocked = false;
        label();
      }
    } catch (_) {
      blocked = true;
      label();
    }
  }

  button.addEventListener("click", () => {
    if (!wanted) {
      wanted = true;
      savePreference();
      resume();
    } else if (active.size || !audio.paused) {
      wanted = false;
      savePreference();
      stop();
    } else {
      // Music is wanted but not currently playing (usually autoplay was
      // blocked). Retry playback on this direct button interaction.
      resume();
    }
  });

  audio.addEventListener("play", label);
  audio.addEventListener("pause", label);
  audio.addEventListener("error", () => {
    blocked = true;
    label();
  });

  const previous = Number(sessionStorage.getItem(positionKey));
  if (Number.isFinite(previous) && previous > 0) {
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = previous % audio.duration;
      }
    }, { once: true });
  }

  function save() {
    if (Number.isFinite(audio.currentTime)) {
      sessionStorage.setItem(positionKey, String(audio.currentTime));
    }
    savePreference();
  }
  audio.addEventListener("timeupdate", save);
  window.addEventListener("pagehide", save);

  // Try to start audible playback as soon as each page opens. Browsers may
  // block sound until a visitor gesture; retry on the first gesture anywhere
  // on the page. Do not pause videos when the visitor clicks outside them.
  const unlockPlayback = event => {
    if (!blocked || !wanted || active.size || !audio.paused) return;
    if (event.target.closest && event.target.closest(".portfolio-music")) return;
    resume();
  };
  document.addEventListener("pointerdown", unlockPlayback, { capture: true });
  document.addEventListener("keydown", unlockPlayback, { capture: true });

  // If this page is restored from the browser's back/forward cache, try again.
  window.addEventListener("pageshow", () => {
    if (wanted && audio.paused && !active.size) resume();
  });

  const frames = Array.from(document.querySelectorAll(
    'iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"]'
  ));

  if (frames.length) {
    frames.forEach((frame, i) => {
      const url = new URL(frame.src, location.href);
      url.searchParams.set("enablejsapi", "1");
      url.searchParams.set("playsinline", "1");
      if (location.protocol === "https:" || location.protocol === "http:") {
        url.searchParams.set("origin", location.origin);
      }
      frame.src = url.toString();
      frame.id ||= "portfolio-youtube-" + i;
    });

    const priorCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof priorCallback === "function") priorCallback();

      frames.forEach(frame => {
        let player;
        player = new YT.Player(frame.id, {
          events: {
            onStateChange: event => {
              if (event.data === YT.PlayerState.PLAYING) {
                active.add(player);
                for (const other of players) {
                  if (other !== player && active.has(other)) {
                    try { other.pauseVideo(); } catch (_) {}
                  }
                }
                stop();
              } else if ([
                YT.PlayerState.PAUSED,
                YT.PlayerState.ENDED,
                YT.PlayerState.CUED
              ].includes(event.data)) {
                active.delete(player);
                if (!active.size) resume();
              }
            }
          }
        });
        players.push(player);
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    } else {
      const ytAPI = document.createElement("script");
      ytAPI.src = "https://www.youtube.com/iframe_api";
      ytAPI.async = true;
      document.head.appendChild(ytAPI);
    }
  }

  // Default to music on whenever the visitor has not chosen otherwise.
  // The browser may require a click/tap before it permits audible autoplay.
  if (wanted) resume();
  else label();
});
