console.clear();

AOS.init();
gsap.registerPlugin(ScrollTrigger);

// bannerSwiper ------------------------------ //
function bannerSwiper__init() {
  var swiper = new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 30,
    effect: "fade",
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
// GSAP scrollLeins ------------------------------ //
function scrollLeins__init() {
  const lenis = new Lenis({
    lerp: 0.055,
    easing: (t) => t,
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  gsap.registerPlugin(ScrollTrigger);

  lenis.on("scroll", ScrollTrigger.update);

  gsap.utils.toArray("[data-speed]").forEach((el) => {
    gsap.to(el, {
      y: () => -((el.dataset.speed * window.innerHeight) / 5),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        scrub: true,
      },
    });
  });
}
// marqueeSlide ------------------------------ //
function marqueeSlide__init() {
  let tl;

  function imagesLoaded(container) {
    const imgs = container.querySelectorAll("img");
    return Promise.all(
      [...imgs].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = res;
            })
      )
    );
  }

  async function initMarquee() {
    const box = document.querySelector(".marquee-box");
    const wrapper = document.querySelector(".marquee-wrapper");
    if (!box || !wrapper) return;

    if (tl) tl.kill();

    [...box.children].forEach((item) => {
      if (item.dataset.clone === "true") item.remove();
    });

    const originalItems = [...box.children];

    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.dataset.clone = "true";

      clone.querySelectorAll("img").forEach((img) => {
        img.loading = "eager";
        img.decoding = "sync";
        img.fetchPriority = "high";
      });

      box.appendChild(clone);
    });

    await imagesLoaded(box);

    let totalWidth = 0;
    originalItems.forEach((item) => {
      totalWidth += item.offsetWidth;
    });

    tl = gsap.fromTo(
      box,
      { x: 0 },
      {
        x: -totalWidth,
        duration: 48,
        ease: "none",
        repeat: -1,
        force3D: false,
      }
    );

    wrapper.onmouseenter = () => tl.pause();
    wrapper.onmouseleave = () => tl.play();
  }

  window.addEventListener("load", initMarquee);

  window.addEventListener("resize", () => {
    clearTimeout(window.__marqueeTimer);
    window.__marqueeTimer = setTimeout(initMarquee, 200);
  });
}
// heartDown ------------------------------ //
function heartDown__init() {
  const hearts = document.querySelectorAll(".img-btn-wrapper-heart > img");
  if (!hearts.length) return;

  hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
      heart.classList.toggle("keyDown");
    });
  });
}
// hoveredDark ------------------------------ //
function hoveredDark__init() {
  const saleItems = document.querySelectorAll(".sale-item");

  if (!saleItems.length) return;

  saleItems.forEach((item) => {
    const btn = item.querySelector(".text-box .view-btn");
    const img = item.querySelector(".img-wrapper img");

    if (!btn || !img) return;

    btn.addEventListener("mouseenter", () => {
      img.classList.add("Darkness");
    });

    btn.addEventListener("mouseleave", () => {
      img.classList.remove("Darkness");
    });
  });
}
// timeSaleCountdown ------------------------------ //
function timeSaleCountdown__init() {
  const hEl = document.getElementById("hours");
  const mEl = document.getElementById("minutes");
  const sEl = document.getElementById("seconds");

  if (!hEl || !mEl || !sEl) return;

  const originTime = {
    h: parseInt(hEl.textContent, 10),
    m: parseInt(mEl.textContent, 10),
    s: parseInt(sEl.textContent, 10),
  };

  let totalSeconds =
    originTime.h * 3600 +
    originTime.m * 60 +
    originTime.s;

  function renderTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    hEl.textContent = String(h).padStart(2, "0");
    mEl.textContent = String(m).padStart(2, "0");
    sEl.textContent = String(s).padStart(2, "0");
  }

  setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      totalSeconds =
        originTime.h * 3600 +
        originTime.m * 60 +
        originTime.s;
    }

    renderTime(totalSeconds);
  }, 1000);
}
// Functions Operate Key ------------------------------ //
bannerSwiper__init();
scrollLeins__init();
marqueeSlide__init();
heartDown__init();
hoveredDark__init();
timeSaleCountdown__init();
