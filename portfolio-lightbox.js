document.addEventListener("DOMContentLoaded", () => {
  const tiles = document.querySelectorAll(".work-gallery:not(.storyboard-gallery) a.gallery-tile");
  if (!tiles.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "portfolio-lightbox";
  dialog.setAttribute("aria-label", "Enlarged portfolio image");
  dialog.innerHTML = '<button type="button" class="portfolio-lightbox-close" aria-label="Close image">&times;</button><img alt="">';
  document.body.appendChild(dialog);

  const image = dialog.querySelector("img");
  const close = dialog.querySelector("button");
  const dismiss = () => dialog.close();

  tiles.forEach(tile => {
    tile.removeAttribute("target");
    tile.addEventListener("click", event => {
      event.preventDefault();
      const thumbnail = tile.querySelector("img");
      image.src = thumbnail?.currentSrc || tile.href;
      image.alt = thumbnail?.alt || "Portfolio artwork";
      dialog.showModal();
    });
  });

  close.addEventListener("click", dismiss);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dismiss();
  });
  dialog.addEventListener("close", () => image.removeAttribute("src"));
});
