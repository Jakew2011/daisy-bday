const photos = [
  "https://i.ibb.co/gZ77ngWM/IMG-3500.jpg",
  "https://i.ibb.co/jknzvNPW/785147186-122253325892491555-615905127549114623-n.jpg",
  "https://i.ibb.co/5gbM3jXK/787682554-122253325802491555-5901828991985451214-n.jpg",
  "https://i.ibb.co/1GdcX569/785858308-122253326504491555-6471010449245926106-n.jpg",
  "https://i.ibb.co/Wpc4jzzb/IMG-3531.jpg",
  "https://i.ibb.co/1tPCVrqt/IMG-3755.jpg",
  "https://i.ibb.co/0jDdwbZt/IMG-3762.avif",
  "https://i.ibb.co/CyfZvb1/IMG-3773.avif",
  "https://i.ibb.co/vxsQ3JV5/IMG-3757.avif",
  "https://i.ibb.co/7JZFQN4Z/IMG-3763.jpg"
];
const NAME = "Daisy";
const SECONDS_PER_PHOTO = 5;
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HOLD = SECONDS_PER_PHOTO * 1000;
const TAPES = ["#f6b73c", "#f4a3c0", "#7fb8e6", "#9bd8b5"];
const music = $("music"), muteBtn = $("muteBtn"), stage = $("stage");
const viewer = $("viewer");
const floatingList = $("floatingList");
const screens = document.querySelectorAll(".screen");
const show = (id) => screens.forEach((s) => s.classList.toggle("active", s.id === id));

function clearSplatList() {
  if (!floatingList) return;
  floatingList.replaceChildren();
}

function addSplatThumb(src, placeholder) {
  if (!floatingList) return;
  const thumb = document.createElement("span");
  thumb.className = "splat-chip";
  const img = new Image();
  img.src = src;
  img.alt = "";
  img.loading = "eager";
  thumb.append(img);
  thumb.style.setProperty("--rotate", `${(Math.random() * 24 - 12).toFixed(2)}deg`);
  thumb.style.setProperty("--delay", `${Math.random() * 120}ms`);
  if (placeholder) placeholder.replaceWith(thumb);
  else floatingList.append(thumb);
}

const safePlayMusic = async () => {
  if (!music) return;
  music.volume = 0.7;
  music.muted = false;
  music.currentTime = 0;
  try {
    await music.play();
  } catch (error) {
    console.warn("Audio playback was blocked until the next user interaction.", error);
  }
};

document.documentElement.style.setProperty("--hold", SECONDS_PER_PHOTO + "s");
$("nameEl").textContent = NAME;
clearSplatList();

const cache = {};
function preload(i) {
  if (i >= photos.length) return Promise.resolve(false);
  return (cache[i] ??= new Promise((res) => {
    const im = new Image();
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = photos[i];
    setTimeout(() => res(false), 12000);
  }));
}

let run = 0, current = null;

function restartBar() {
  const bar = $("barFill");
  bar.classList.remove("run");
  void bar.offsetWidth;
  bar.classList.add("run");
}

async function showSlide(i, token) {
  const ok = await preload(i);
  if (token !== run || !ok) return false;

  let a = (1.5 + Math.random() * 3.5) * (Math.random() < 0.5 ? -1 : 1);
  const el = document.createElement("figure");
  el.className = "slide";
  el.style.setProperty("--tape", pick(TAPES));
  el.style.transform = `rotate(${a}deg)`;
  el.style.zIndex = current ? "1" : "2";
  el.dataset.r = a;
  const img = new Image();
  img.src = photos[i];
  img.alt = `Photo ${i + 1} of ${photos.length}`;
  el.append(img);
  stage.append(el);

  const old = current;
  current = el;
  if (old) old.style.zIndex = "2";
  $("counter").textContent =
    `${String(i + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;

  if (!old) {
    await el.animate(
      [
        { opacity: 0, transform: `rotate(${a}deg) scale(.96)` },
        { opacity: 1, transform: `rotate(${a}deg) scale(1)` }
      ],
      { duration: reduce ? 250 : 450, easing: "ease-out" }
    ).finished;
    if (token !== run) return false;
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "splat-placeholder";
    floatingList.append(placeholder);
    const bounds = old.getBoundingClientRect();
    const targetBounds = placeholder.getBoundingClientRect();
    const offsetX = targetBounds.left + targetBounds.width / 2 - (bounds.left + bounds.width / 2);
    const offsetY = targetBounds.top + targetBounds.height / 2 - (bounds.top + bounds.height / 2);
    const startRotation = Number(old.dataset.r);
    const turns = (Math.random() < 0.5 ? -1 : 1) * 360;
    const thumbnailScale = Math.min(56 / Math.max(bounds.width, bounds.height), 0.24);
    try {
      await old.animate(
        [
          {
            opacity: 1,
            transform: `rotate(${startRotation}deg) scale(1)`,
            easing: "ease-in-out"
          },
          {
            opacity: 1,
            transform: `translate3d(${offsetX * 0.18}px, ${offsetY * 0.18}px, 0) rotate(${startRotation + turns * 0.2}deg) scaleX(.82) scaleY(.76)`,
            offset: 0.22,
            easing: "ease-in-out"
          },
          {
            opacity: 0.95,
            transform: `translate3d(${offsetX * 0.58}px, ${offsetY * 0.58}px, 0) rotate(${startRotation + turns * 0.58}deg) scaleX(.48) scaleY(.42)`,
            offset: 0.6,
            easing: "ease-in-out"
          },
          {
            opacity: 0.7,
            transform: `translate3d(${offsetX * 0.9}px, ${offsetY * 0.9}px, 0) rotate(${startRotation + turns * 0.88}deg) scale(${thumbnailScale * 1.3})`,
            offset: 0.9,
            easing: "ease-in-out"
          },
          {
            opacity: 0,
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${startRotation + turns}deg) scale(${thumbnailScale})`
          }
        ],
        {
          duration: reduce ? 1400 : 2600,
          easing: "linear",
          fill: "forwards"
        }
      ).finished;
      if (token !== run) {
        placeholder.remove();
        return false;
      }
      addSplatThumb(old.querySelector("img").src, placeholder);
    } catch (error) {
      placeholder.remove();
      throw error;
    }
  }
  if (old) old.remove();
  preload(i + 1);
  return token === run;
}

async function runShow() {
  const token = ++run;
  for (let i = 0; i < photos.length; i++) {
    if (!(await showSlide(i, token))) { if (token !== run) return; continue; }
    restartBar();
    await wait(HOLD);
    if (token !== run) return;
  }
  goReveal();
}

function goReveal() {
  show("reveal");
  const box = $("confetti");
  box.replaceChildren();
  if (reduce) return;
  const colors = ["#e23d78", "#f6b73c", "#7fb8e6", "#1d2a44", "#9bd8b5"];
  for (let n = 0; n < 70; n++) {
    const c = document.createElement("b");
    c.style.left = Math.random() * 100 + "%";
    c.style.background = pick(colors);
    box.append(c);
    c.animate(
      [{ transform: "translateY(0) rotate(0)", opacity: 1 },
       { transform: `translate(${Math.random() * 80 - 40}px, 105vh) rotate(${Math.random() * 900 - 450}deg)`, opacity: 1 }],
      { duration: 2400 + Math.random() * 2200, delay: Math.random() * 900, easing: "ease-in", fill: "forwards" }
    ).finished.then(() => c.remove()).catch(() => {});
  }
}

let vi = 0;

function renderAlbum() {
  const grid = $("grid");
  grid.replaceChildren();
  if (!photos.length) {
    return;
  }
  photos.forEach((url, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "pol";
    card.style.setProperty("--r", (((i * 37) % 11) - 5) * 0.7 + "deg");
    card.style.setProperty("--tape", TAPES[i % TAPES.length]);
    card.setAttribute("aria-label", `Open photo ${i + 1}`);
    const im = new Image();
    im.src = url; im.alt = ""; im.loading = "lazy";
    im.onerror = () => card.remove();
    card.append(im);
    card.onclick = () => openViewer(i);
    grid.append(card);
  });
}
function openViewer(i) { vi = i; $("vImg").src = photos[vi]; viewer.hidden = false; }
function step(d) { vi = (vi + d + photos.length) % photos.length; $("vImg").src = photos[vi]; }
const closeViewer = () => { viewer.hidden = true; };

let sx = 0;
viewer.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) closeViewer();
});
document.addEventListener("keydown", (e) => {
  if (viewer.hidden) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});
$("vClose").onclick = closeViewer;
$("vPrev").onclick = () => step(-1);
$("vNext").onclick = () => step(1);

$("startBtn").onclick = async () => {
  const startBtn = $("startBtn");
  if (startBtn.disabled) return;
  startBtn.disabled = true;
  run++;
  stage.replaceChildren();
  current = null;
  clearSplatList();
  $("barFill").classList.remove("run");
  safePlayMusic();
  if (muteBtn) muteBtn.hidden = false;
  show("show");
  runShow();
};

muteBtn.onclick = () => {
  if (!music) return;
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? "Sound off" : "Sound on";
  muteBtn.setAttribute("aria-pressed", String(music.muted));
};

$("albumBtn").onclick = () => {
  clearSplatList();
  renderAlbum();
  $("album").scrollTop = 0;
  show("album");
};

$("restartBtn").onclick = () => {
  run++;                                  // cancels any running slideshow
  stage.replaceChildren();
  current = null;
  $("startBtn").disabled = false;
  $("barFill").classList.remove("run");
  closeViewer();
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
  if (muteBtn) muteBtn.hidden = true;
  clearSplatList();
  show("start");
};

window.previewAlbum = () => {
  run++;
  stage.replaceChildren();
  current = null;
  $("startBtn").disabled = false;
  $("barFill").classList.remove("run");
  closeViewer();
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
  if (muteBtn) muteBtn.hidden = true;
  clearSplatList();
  renderAlbum();
  $("album").scrollTop = 0;
  show("album");
};

preload(0);
