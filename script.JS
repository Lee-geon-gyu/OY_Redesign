console.clear();

AOS.init();
gsap.registerPlugin(ScrollTrigger);

// loadingPage ------------------------------ //
function loadingPage__init() {
  $("html, body").css({
    overflow: "hidden",
    height: "100%",
  });

  function preventScroll(e) {
    e.preventDefault();
  }

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });

  function preventKey(e) {
    const keys = [32, 37, 38, 39, 40];
    if (keys.includes(e.keyCode)) {
      e.preventDefault();
    }
  }
  document.addEventListener("keydown", preventKey);

  setTimeout(() => {
    $(".loading-page").fadeOut(1500, function () {
      $("html, body").css({
        overflow: "",
        height: "",
      });

      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("keydown", preventKey);
    });
  }, 1000);
}
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
            }),
      ),
    );
  }

  function clearClones(box) {
    [...box.children].forEach((item) => {
      if (item.dataset.clone === "true") item.remove();
    });
  }

  function measureWidth(items) {
    let w = 0;
    items.forEach((item) => {
      w += item.getBoundingClientRect().width;
    });
    return Math.round(w);
  }

  async function initMarquee() {
    const box = document.querySelector(".marquee-box");
    const wrapper = document.querySelector(".marquee-wrapper");
    if (!box || !wrapper) return;

    if (tl) tl.kill();
    clearClones(box);

    const originalItems = [...box.children];
    if (!originalItems.length) return;

    await imagesLoaded(box);

    const baseWidth = measureWidth(originalItems);
    if (!baseWidth) return;

    const needSets = Math.max(
      2,
      Math.ceil((wrapper.clientWidth * 2) / baseWidth) + 1,
    );
    for (let s = 0; s < needSets; s++) {
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
    }

    await imagesLoaded(box);

    const wrapX = gsap.utils.wrap(-baseWidth, 0);

    gsap.set(box, { x: 0 });

    tl = gsap.to(box, {
      x: `-=${baseWidth}`,
      duration: 48,
      ease: "none",
      repeat: -1,
      force3D: true,
      modifiers: {
        x: (x) => `${Math.round(wrapX(parseFloat(x)))}px`,
      },
    });

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

  let totalSeconds = originTime.h * 3600 + originTime.m * 60 + originTime.s;

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
      totalSeconds = originTime.h * 3600 + originTime.m * 60 + originTime.s;
    }

    renderTime(totalSeconds);
  }, 1000);
}
// itemsSwiper ------------------------------ //
function itemsSwiper__Init() {
  const itemsSwiper = new Swiper(".item-slider", {
    loop: true,
    centeredSlides: true,
    watchOverflow: false,
    speed: 600,

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 60,
      },
      450: {
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 60,
      },
      1024: {
        slidesPerView: 3,
        centeredSlides: true,
        spaceBetween: 10,
      },
    },
  });

  const swiperEl = document.querySelectorAll(".item-box img");

  swiperEl.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      itemsSwiper.autoplay.stop();
    });

    el.addEventListener("mouseleave", () => {
      itemsSwiper.autoplay.start();
    });
  });
}
// itemboxViewer ------------------------------ //
function itemboxViewer__init() {
  const clickers = document.querySelectorAll(".selection-sub-title");

  clickers.forEach((el) => {
    el.addEventListener("click", () => {
      const sec = el.closest(".sec-recommend");
      if (!sec) return;

      sec.querySelector(".clicker")?.classList.remove("clicker");
      el.classList.add("clicker");

      const index = el.dataset.index;
      const target = sec.querySelector(`:scope > .item-box-vision-${index}`);
      if (!target) return;

      [...sec.children].forEach((child) => {
        if (!child.className.includes("item-box")) return;

        if (child === target) {
          child.classList.add("viewer");
          child.style.display = "flex";
          child.style.transition = "opacity 0.2s ease";
          child.style.opacity = "0";

          requestAnimationFrame(() => {
            child.style.opacity = "1";
          });
        } else if (child.classList.contains("viewer")) {
          child.style.transition = "opacity 0.2s ease";
          child.style.opacity = "0";

          setTimeout(() => {
            child.classList.remove("viewer");
            child.style.display = "none";
          }, 150);
        }
      });
    });
  });

  const first = document.querySelector(".selection-sub-title[data-index='1']");
  if (first) {
    first.classList.add("clicker");
    const sec = first.closest(".sec-recommend");
    const firstBox = sec.querySelector(":scope > .item-box-vision-1");
    if (firstBox) {
      firstBox.classList.add("viewer");
      firstBox.style.display = "flex";
      firstBox.style.opacity = "1";
    }
  }
}
// Functions Operate Key ------------------------------ //
// loadingPage__init();
bannerSwiper__init();
scrollLeins__init();
marqueeSlide__init();
heartDown__init();
hoveredDark__init();
timeSaleCountdown__init();
itemsSwiper__Init();
itemboxViewer__init();
