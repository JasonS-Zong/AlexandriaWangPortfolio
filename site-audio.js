/* Soundtrack: "Chill lofi inspired" by omfgdude, CC0.
   https://opengameart.org/content/chill-lofi-inspired */
document.addEventListener("DOMContentLoaded", () => {
  const enabledKey = "aw-portfolio-music-enabled";
  const positionKey = "aw-portfolio-music-position";
  const audio = document.createElement("audio");
  audio.src = "https://opengameart.org/sites/default/files/ChillLofiR_0.mp3";
  audio.loop = true;
  audio.volume = 0.22;
  audio.preload = "metadata";
  document.body.appendChild(audio);

  const widget = document.createElement("div");
  widget.className = "portfolio-music";
  widget.innerHTML = '<button class="portfolio-music-toggle" type="button" aria-label="Toggle background music" aria-pressed="false">♫ Play music</button><a href="https://opengameart.org/content/chill-lofi-inspired" target="_blank" rel="noopener noreferrer" class="portfolio-music-credit">Lo-fi by omfgdude · CC0</a>';
  document.body.appendChild(widget);
  const button = widget.querySelector("button");
  const active = new Set();
  const players = [];
  let wanted = sessionStorage.getItem(enabledKey) !== "false";
  let blocked = false;
  let unavailable = false;

  function label() {
    button.textContent = !wanted ? "♫ Music off" : active.size ? "♫ Paused for video" :
      unavailable ? "♫ Music unavailable" : !audio.paused ? "♫ Pause music" : "♫ Play music";
    button.setAttribute("aria-pressed", String(wanted));
  }

  function stop() {
    audio.pause();
    label();
  }

  function resume() {
    if (!wanted || active.size || unavailable) { label(); return; }
    const attempt = audio.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(() => { blocked = false; label(); })
        .catch(() => { blocked = true; label(); });
    }
    label();
  }

  button.addEventListener("click", () => {
    wanted = !wanted;
    sessionStorage.setItem(enabledKey, String(wanted));
    if (wanted) resume(); else stop();
  });
  audio.addEventListener("play", label);
  audio.addEventListener("pause", label);
  audio.addEventListener("error", () => { unavailable = true; label(); });
  const previous = Number(sessionStorage.getItem(positionKey));
  if (Number.isFinite(previous) && previous > 0) {
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = previous % audio.duration;
      }
    }, {once: true});
  }
  function save() {
    if (Number.isFinite(audio.currentTime)) {
      sessionStorage.setItem(positionKey, String(audio.currentTime));
    }
    sessionStorage.setItem(enabledKey, String(wanted));
  }
  audio.addEventListener("timeupdate", save);
  window.addEventListener("pagehide", save);

  // Browser autoplay restrictions may require a first interaction.
  // Clicking away from a video never pauses the video or resumes the music.
  document.addEventListener("pointerdown", () => {
    if (blocked && wanted && !active.size) {
      resume();
    }
  }, { once: true, capture: true });

  const frames = Array.from(document.querySelectorAll(
    'iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"]'));
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
        const player = new YT.Player(frame.id, {
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
              } else if ([YT.PlayerState.PAUSED, YT.PlayerState.ENDED, YT.PlayerState.CUED].includes(event.data)) {
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

  if (wanted) resume();
  else label();
});
