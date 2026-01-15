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
      pauseOnMouseEnter: true,
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
        duration: 12,
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
// marqueeSlide ------------------------------ //
function heartDown__init() {
  const hearts = document.querySelectorAll(
    ".img-btn-wrapper-heart > img"
  );
  if (!hearts.length) return;

  hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
      heart.classList.toggle("keyDown");
    });
  });
}
// Functions Operate Key ------------------------------ //
bannerSwiper__init();
scrollLeins__init();
marqueeSlide__init();
heartDown__init();
