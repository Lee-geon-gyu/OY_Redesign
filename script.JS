console.clear();

AOS.init();
gsap.registerPlugin(ScrollTrigger);

// loadingPage ------------------------------ //
function loadingPage__init() {
  const loader = document.querySelector(".loading-page");
  if (!loader) return;
  const copy = loader.querySelector(".loader-copy");
  const phraseWindow = loader.querySelector(".loader-phrase-window");
  const outgoing = loader.querySelector(".loader-phrase--current");
  const incoming = loader.querySelector(".loader-phrase--next");
  const savedStyles = [document.documentElement, document.body].map(
    (element) => ({
      element,
      overflow: element.style.overflow,
      height: element.style.height,
    }),
  );
  const surfaces = [...document.body.children]
    .filter(
      (element) =>
        element !== loader &&
        !["SCRIPT", "STYLE", "LINK"].includes(element.tagName),
    )
    .map((element) => ({ element, inert: element.inert }));
  savedStyles.forEach(({ element }) => {
    element.style.overflow = "hidden";
    element.style.height = "100%";
  });
  surfaces.forEach(({ element }) => {
    element.inert = true;
  });
  const blockedKeys = new Set([
    " ",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "PageUp",
    "PageDown",
    "Home",
    "End",
  ]);
  const preventScroll = (event) => event.preventDefault();
  const preventKey = (event) => {
    if (blockedKeys.has(event.key)) event.preventDefault();
  };
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("keydown", preventKey);
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    loader.dataset.stage = "complete";
    gsap.set(loader, { display: "none" });
    loader.setAttribute("aria-hidden", "true");
    savedStyles.forEach(({ element, overflow, height }) => {
      element.style.overflow = overflow;
      element.style.height = height;
    });
    surfaces.forEach(({ element, inert }) => {
      element.inert = inert;
    });
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("keydown", preventKey);
    document.dispatchEvent(new Event("oliveyoung:ready"));
  }

  function animate() {
    const timeline = gsap.timeline({
      data: "oliveyoung-loader",
      onComplete: finish,
    });
    const stage = (name) => {
      loader.dataset.stage = name;
    };
    gsap.set(copy, { autoAlpha: 0 });
    gsap.set(phraseWindow, {
      "--loader-reveal": "0%",
      "--loader-fog": 0,
      "--loader-feather": "0.38em",
    });
    gsap.set(outgoing, {
      y: 0,
      yPercent: 0,
      opacity: 1,
      filter: "blur(0px)",
      clipPath: "inset(0% 100% 0% 0%)",
    });
    gsap.set(incoming, {
      y: 0,
      yPercent: 105,
      opacity: 0,
      filter: "blur(3px)",
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage("fade-out");
      timeline.to(loader, { autoAlpha: 0, duration: 0.2 }, 0);
      return;
    }

    timeline
      .addLabel("intro", 0)
      .call(() => stage("intro"), [], "intro")
      .set(copy, { autoAlpha: 1 }, 0.1)
      .to(
        outgoing,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "sine.inOut",
        },
        0.1,
      )
      .to(
        phraseWindow,
        {
          "--loader-reveal": "100%",
          duration: 1.5,
          ease: "sine.inOut",
        },
        0.1,
      )
      .to(
        phraseWindow,
        { "--loader-fog": 1, duration: 0.25, ease: "sine.inOut" },
        0.16,
      )
      .to(
        phraseWindow,
        {
          "--loader-fog": 0,
          "--loader-feather": "0em",
          duration: 0.35,
          ease: "sine.inOut",
        },
        1.25,
      )
      .addLabel("first-copy", 1.6)
      .addLabel("phrase-roll", "first-copy+=1.1")
      .call(() => stage("phrase-roll"), [], "phrase-roll")
      .to(
        outgoing,
        {
          yPercent: -105,
          opacity: 0,
          filter: "blur(3px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        "phrase-roll",
      )
      .to(
        incoming,
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        "phrase-roll",
      )
      .addLabel("second-copy", "phrase-roll+=1.5")
      .call(() => stage("second-copy"), [], "second-copy")
      .addLabel("copy-fade-out", "second-copy+=1.45")
      .call(() => stage("copy-fade-out"), [], "copy-fade-out")
      .to(
        copy,
        { autoAlpha: 0, duration: 0.7, ease: "sine.inOut" },
        "copy-fade-out",
      )
      .addLabel("fade-out", "copy-fade-out+=0.63") // 90% of the 0.7s text fade.
      .call(() => stage("fade-out"), [], "fade-out")
      .to(
        loader,
        { autoAlpha: 0, duration: 0.7, ease: "sine.inOut" },
        "fade-out",
      );
  }

  const fontsReady = Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  fontsReady.then(animate).catch(finish);
}

// headerChangeOnSection ------------------------------ //
function headerChangeOnSection__init() {
  const header = document.querySelector("header");
  const darkBox = document.querySelector(".time-sale-wrapper");
  const darkSurfaces = [
    darkBox,
    document.querySelector(".sec-mobile-banner"),
  ].filter(Boolean);
  const triggerHeight = 930;
  const scrollThreshold = 8;
  let lastScrollY = Math.max(window.scrollY, 0);

  if (!header) return;

  function updateHeaderColor() {
    const currentScrollY = Math.max(window.scrollY, 0);

    if (currentScrollY <= 0) {
      header.classList.remove("header-hidden");
    } else if (Math.abs(currentScrollY - lastScrollY) >= scrollThreshold) {
      header.classList.toggle("header-hidden", currentScrollY > lastScrollY);
      lastScrollY = currentScrollY;
    }

    if (window.scrollY > triggerHeight) {
      header.classList.add("on-sec-k");
    } else {
      header.classList.remove("on-sec-k");
    }

    // Use the visible header position so its ink is ready before the slide-in starts.
    const headerRect = { top: 0, bottom: header.offsetHeight };
    const isOverDarkBox = darkSurfaces.some((surface) => {
      const rect = surface.getBoundingClientRect();
      const style = surface === darkBox ? getComputedStyle(surface) : null;
      const clipTop =
        parseFloat(style?.getPropertyValue("--sale-clip-top")) || 0;
      const clipBottom =
        parseFloat(style?.getPropertyValue("--sale-clip-bottom")) || 0;
      return (
        rect.top + clipTop < headerRect.bottom &&
        rect.bottom - clipBottom > headerRect.top
      );
    });

    header.classList.toggle("on-dark-box", isOverDarkBox);
  }

  let ticking = false;
  function requestHeaderColorUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      updateHeaderColor();
      ticking = false;
    });
  }

  updateHeaderColor();
  window.addEventListener("scroll", requestHeaderColorUpdate, {
    passive: true,
  });
  window.addEventListener("resize", requestHeaderColorUpdate);
  header.addEventListener("oliveyoung:sale-surface", requestHeaderColorUpdate);
}
// bannerSwiper ------------------------------ //
function bannerSwiper__init() {
  var swiper = new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 30,
    speed: 1250,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: 5000,
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
  // Start the first hero slide only once the new loader has finished.
  if (document.querySelector(".loading-page")?.style.display !== "none") {
    swiper.autoplay.stop();
    document.addEventListener(
      "oliveyoung:ready",
      () => swiper.autoplay.start(),
      { once: true },
    );
  }
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

  timeSaleReturn__init(lenis);

  // Same 1.05s CSS ease curve as the JW return-to-top button.
  function referenceEase(progress) {
    let low = 0;
    let high = 1;
    let t = progress;
    for (let index = 0; index < 14; index++) {
      t = (low + high) / 2;
      const x =
        0.75 * (1 - t) * (1 - t) * t + 0.75 * (1 - t) * t * t + t * t * t;
      if (x < progress) low = t;
      else high = t;
    }
    return 0.3 * (1 - t) * (1 - t) * t + 3 * (1 - t) * t * t + t * t * t;
  }

  document.querySelector(".express-top-btn")?.addEventListener("click", () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    lenis.scrollTo(0, {
      duration: reduced ? 0 : 1.05,
      easing: referenceEase,
      lerp: 0,
      immediate: reduced,
      force: true,
      lock: true,
    });
  });

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
        slidesPerView: 2.2,
        centeredSlides: true,
        spaceBetween: 20,
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
// shortbtnDropdown ------------------------------ //
function shortbtnDropdown__init() {
  const buttons = document.querySelectorAll(
    "footer > .ft-top-box > .contact-wrapper > .right-box > .short-btn",
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const parent = this.parentElement;
      const list = parent.querySelector(":scope > .affiliate-list");
      if (!list) return;

      list.style.transition = "none";

      const isOpen = list.offsetHeight > 0;

      list.style.overflow = "hidden";

      if (isOpen) {
        const height = list.scrollHeight;
        list.style.height = height + "rem";

        requestAnimationFrame(() => {
          list.style.transition = "height 0.5s ease";
          list.style.height = "0px";
        });

        setTimeout(() => {
          list.style.display = "none";
        }, 500);
      } else {
        list.style.display = "flex";
        list.style.height = "0px";

        const height = list.scrollHeight;

        requestAnimationFrame(() => {
          list.style.transition = "height 0.5s ease";
          list.style.height = height + "rem";
        });
      }
    });
  });
}
// bottomSelectboxDropDown ------------------------------ //
function bottomSelectboxDropDown__init() {
  const buttons = document.querySelectorAll(
    "footer > .ft-top-box > .contact-wrapper > .right-box > .short-btn",
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.querySelector(":scope > ul")?.classList.toggle("bottomDropDown");
      this.querySelector(":scope > div > .img-wrapper > img")?.classList.toggle(
        "rotateReverse",
      );

      this.parentElement?.classList.toggle("addColor");
    });
  });
}
// Each element enters after crossing a line just above the viewport bottom.
function sectionReveal__init() {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window) ||
    !Element.prototype.animate
  )
    return;

  // Hero uses only its original slideshow and floating motion, without entrance fades.
  const selectors = [
    ".sec-category > .text-box, .sec-category > .marquee-wrapper",
    ".sec-event-products > .text-box, .sec-event-products .event-item",
    ".sec-best-items > .text-box, .sec-best-items > .item-slider",
    ".sec-mobile-banner > .text-box > div, .sec-mobile-banner > .mobile-version-img-container > img",
    ".sec-recommend > .text-box > .top-box, .sec-recommend > .text-box > .bottom-box",
    ".sec-recommend > .item-box > .left-box",
    ".sec-recommend .item-unit > a, .sec-recommend .item-unit > .item-explain-wrapper",
    ".sec-news > .text-box, .sec-news > .news-wrapper > .left-box, .sec-news .launching",
  ];
  const targets = new Set();
  selectors.forEach((selector) =>
    document
      .querySelectorAll(selector)
      .forEach((target) => targets.add(target)),
  );
  const pending = new Set(targets);
  const animations = new Map();
  let observer;
  let started = false;
  let resizeFrame;
  let endFrame;
  let lastScrollY = Math.max(scrollY, 0);
  let scrollingUp = false;

  function revealBatch(elements) {
    const ordered = [...new Set(elements)]
      .filter((target) => pending.has(target))
      .map((target) => ({ target, rect: target.getBoundingClientRect() }))
      .sort((a, b) =>
        Math.abs(a.rect.top - b.rect.top) > 8
          ? a.rect.top - b.rect.top
          : a.rect.left - b.rect.left,
      );
    ordered.forEach(({ target }, index) => {
      pending.delete(target);
      target.dataset.scrollReveal = "revealing";
      const animation = target.animate(
        [
          { opacity: 0, translate: "0 28px" },
          { opacity: 1, translate: "0 0" },
        ],
        {
          duration: 800,
          delay: index * 70,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
      animations.set(target, animation);
      animation.onfinish = () => {
        if (animations.get(target) !== animation) return;
        target.dataset.scrollReveal = "done";
        animation.cancel();
        animations.delete(target);
      };
    });
  }

  // The document's last row cannot pass the inset line; reveal it at the page end.
  function checkPageEnd() {
    endFrame = undefined;
    if (!started) return;
    // Rearm only fully off-screen elements below us while moving upward.
    // Reading all bounds first avoids alternating layout reads and writes.
    if (scrollingUp) {
      const reset = [...targets].filter((target) => {
        if (pending.has(target)) return false;
        const rect = target.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top >= innerHeight;
      });
      reset.forEach((target) => {
        animations.get(target)?.cancel();
        animations.delete(target);
        target.dataset.scrollReveal = "pending";
        pending.add(target);
      });
    }
    if (scrollY + innerHeight < document.documentElement.scrollHeight - 2)
      return;
    revealBatch(
      [...pending].filter((target) => {
        const rect = target.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < innerHeight &&
          rect.bottom > 0
        );
      }),
    );
  }
  function requestEndCheck() {
    const current = Math.max(scrollY, 0);
    if (Math.abs(current - lastScrollY) > 0.5)
      scrollingUp = current < lastScrollY;
    lastScrollY = current;
    if (!endFrame) endFrame = requestAnimationFrame(checkPageEnd);
  }

  function observeTargets() {
    if (!started) return;
    observer?.disconnect();
    const inset = Math.min(180, innerHeight * 0.2);
    observer = new IntersectionObserver(
      (entries) => {
        revealBatch(
          entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target),
        );
      },
      { rootMargin: `0px 0px -${inset}px 0px`, threshold: 0 },
    );
    targets.forEach((target) => observer.observe(target));
    requestEndCheck();
  }
  function start() {
    started = true;
    observeTargets();
    document.fonts.ready.then(observeTargets);
  }
  function onResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(observeTargets);
  }

  targets.forEach((target) => {
    target.dataset.scrollReveal = "pending";
  });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", requestEndCheck, { passive: true });
  if (document.querySelector(".loading-page")?.style.display === "none")
    start();
  else document.addEventListener("oliveyoung:ready", start, { once: true });

  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (event) => {
      if (!event.matches) return;
      started = false;
      observer?.disconnect();
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(endFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", requestEndCheck);
      document.removeEventListener("oliveyoung:ready", start);
      targets.forEach((target) => {
        target.dataset.scrollReveal = "done";
      });
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      pending.clear();
    });
}

// The app banner is a clipped window behind the two neighboring white sections.
function appBannerParallax__init() {
  const banner = document.querySelector(".sec-mobile-banner");
  if (!banner) return;

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const compact = () => window.innerWidth <= 767;
    const backgroundRange = () => Math.min(42, banner.offsetHeight * 0.07);
    const phoneRange = () =>
      (compact() ? 32 : Math.min(64, banner.offsetHeight * 0.1)) * 1.2;
    const copyRange = () => phoneRange();

    gsap.fromTo(
      banner,
      {
        "--app-banner-bg-y": () => `${backgroundRange()}px`,
        "--app-banner-phone-y": () => `${phoneRange()}px`,
        "--app-banner-copy-y": () => `${copyRange()}px`,
        "--app-banner-bg-scale": 1.2,
      },
      {
        "--app-banner-bg-y": () => `${-backgroundRange()}px`,
        "--app-banner-phone-y": () => `${-phoneRange()}px`,
        "--app-banner-copy-y": () => `${-copyRange()}px`,
        "--app-banner-bg-scale": 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: banner,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  // The existing loader temporarily gives html/body a fixed height.
  // Measure scroll positions only after that height is released and fonts settle.
  function refreshAfterLoading() {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }
  if (document.querySelector(".loading-page")?.style.display === "none") {
    refreshAfterLoading();
  } else {
    document.addEventListener("oliveyoung:ready", refreshAfterLoading, {
      once: true,
    });
  }
}

// A small scroll-linked lift returns the footer to its original final position.
function footerLift__init() {
  const footer = document.querySelector("footer");
  if (!footer) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const distance = () => (window.innerWidth <= 767 ? 96 : 144);
    const lift = gsap.fromTo(
      footer,
      {
        "--footer-reveal-y": () => `${distance()}px`,
      },
      {
        "--footer-reveal-y": "0px",
        ease: "none",
        scrollTrigger: {
          trigger: footer,
          start: "top bottom",
          end: "clamp(bottom bottom)",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      },
    );

    let height = footer.offsetHeight;
    let frame;
    const observer = new ResizeObserver(() => {
      const next = footer.offsetHeight;
      if (next === height) return;
      height = next;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(footer);
    // Layout and reveal overflow can settle after refresh; keep the true page end at zero.
    function settleAtPageEnd() {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - innerHeight,
      );
      if (scrollY >= max - 1 && lift.scrollTrigger.end > max + 1)
        lift.scrollTrigger.refresh();
    }
    window.addEventListener("scroll", settleAtPageEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", settleAtPageEnd);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  });
}

// Hold at the sale boundary, finish the fold, then continue the upward gesture.
function timeSaleReturn__init(lenis) {
  const scene = document.querySelector(".sale-scene");
  if (!scene) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let mode = "idle",
    generation = 0,
    holdY = 0,
    lastTouchY = 0;
  let touchDirection = 0,
    lastTouchAt = 0,
    touchExcluded = false,
    lastObservedY = Math.max(scrollY, 0);
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function setMode(value) {
    mode = value;
    scene.dataset.scrollGate = value;
  }
  setMode("idle");

  function cancel() {
    touchDirection = 0;
    if (mode === "idle") return;
    generation++;
    entryAligned = false;
    setDownHold("ready");
    lenis.stop();
    lenis.start();
    setMode("idle");
    scene.dispatchEvent(new Event("oliveyoung:sale-leave-cancel"));
  }
  function excluded(target) {
    return (
      target instanceof Element &&
      target.closest(
        "input, textarea, select, [contenteditable='true'], [data-native-scroll], [data-lenis-prevent]",
      )
    );
  }
  function block(event) {
    if (event?.cancelable) event.preventDefault();
    event?.stopImmediatePropagation();
  }
  function leave(delta, event, explicitTarget, nativeTouch = false) {
    if (event && (!event.cancelable || excluded(event.target))) return;
    if (mode !== "idle") {
      if (delta > 0) {
        cancel();
        return;
      }
      block(event);
      return;
    }
    if (
      reduced.matches ||
      delta >= 0 ||
      Number(scene.dataset.expandProgress || 0) <= 0.01
    )
      return;
    const current = Math.max(0, scrollY);
    const top = scene.getBoundingClientRect().top + current;
    const target =
      explicitTarget ??
      Math.max(
        0,
        Math.min(
          current,
          Number.isFinite(lenis.targetScroll) ? lenis.targetScroll : current,
        ) + delta,
      );
    // Own the first upward touch move near the boundary before native scrolling takes over.
    const nearTouchExit =
      (nativeTouch || event?.type === "touchmove") &&
      current <= top + innerHeight * 0.15;
    if (
      current < top - innerHeight * 0.2 - 2 ||
      (target >= top - 1 && !nearTouchExit)
    )
      return;
    block(event);
    const run = ++generation;
    const destination = Math.max(0, Math.min(top - 48, target));
    lenis.stop();

    function fold() {
      if (run !== generation) return;
      holdY = scrollY;
      setMode("closing");
      scene.dispatchEvent(
        new CustomEvent("oliveyoung:sale-leave", {
          detail: {
            resume() {
              if (run !== generation) return;
              setMode("leaving");
              lenis.start();
              lenis.scrollTo(destination, {
                duration: 0.65,
                easing: ease,
                lerp: 0,
                force: true,
                lock: true,
                onComplete() {
                  if (run === generation) setMode("idle");
                },
              });
            },
          },
        }),
      );
    }
    // Large gestures may approach from lower product rows before reaching the boundary.
    if (current > top + innerHeight * 0.15) {
      setMode("approaching");
      lenis.scrollTo(top, {
        duration: 0.4,
        easing: ease,
        lerp: 0,
        force: true,
        lock: true,
        onComplete: fold,
      });
    } else fold();
  }

  // Let the capsule open during the natural approach; cap only input that passes its center.
  let downHold = "ready",
    entryAligned = false,
    entryAnchor = 0;
  let heldAt = 0,
    lastWheelAt = -Infinity,
    touchSequence = 0,
    heldTouchSequence = 0;
  const entryMode = () => mode === "entering" || mode === "held";
  function setDownHold(value) {
    downHold = value;
    scene.dataset.downHold = value;
  }
  setDownHold("ready");

  function finishEntry() {
    if (
      mode !== "entering" ||
      !entryAligned ||
      Number(scene.dataset.expandProgress || 0) < 0.9999
    )
      return;
    holdY = scrollY;
    heldAt = performance.now();
    heldTouchSequence = touchSequence;
    setMode("held");
    setDownHold("held");
  }
  scene.addEventListener("oliveyoung:sale-opening", () => {
    if (mode === "idle") setDownHold("ready");
  });
  scene.addEventListener("oliveyoung:sale-expanded", () => {
    finishEntry();
  });

  function beginEntry(anchor) {
    const run = ++generation;
    entryAnchor = Math.round(anchor);
    entryAligned = false;
    setMode("entering");
    setDownHold("expanding");
    lenis.stop();
    scene.dispatchEvent(new Event("oliveyoung:sale-enter"));
    function aligned() {
      if (run !== generation || mode !== "entering") return;
      entryAligned = true;
      holdY = scrollY;
      finishEntry();
    }
    if (Math.abs(scrollY - entryAnchor) < 1) aligned();
    else
      lenis.scrollTo(entryAnchor, {
        lerp: 0.055,
        force: true,
        lock: true,
        onComplete: aligned,
      });
  }
  function releaseEntry() {
    generation++;
    entryAligned = false;
    setMode("idle");
    setDownHold("released");
    lenis.stop();
    lenis.start();
    const stage = scene.querySelector(".sale-stage");
    const top = scene.getBoundingClientRect().top + scrollY;
    const stickyDistance = Math.max(0, scene.offsetHeight - stage.offsetHeight);
    if (stickyDistance && scrollY < top + stickyDistance)
      lenis.scrollTo(top + stickyDistance, { immediate: true, force: true });
  }
  function enterDown(delta, event, kind, fresh = false) {
    if (reduced.matches || (event && excluded(event.target))) return false;
    if (entryMode()) {
      if (delta < 0) {
        cancel();
        if (kind === "touch") touchDirection = -1;
        return false;
      }
      if (mode === "held" && fresh && performance.now() - heldAt >= 120) {
        releaseEntry();
        return false;
      }
      block(event);
      return true;
    }
    if (mode !== "idle" || delta <= 0) return false;
    const loader = document.querySelector(".loading-page");
    if (loader && loader.style.display !== "none") return false;
    const stage = scene.querySelector(".sale-stage");
    const current = Math.max(0, scrollY),
      anchor = scene.getBoundingClientRect().top + current;
    if (
      downHold === "released" &&
      current < anchor - 2 &&
      Number(scene.dataset.expandProgress || 0) < 0.01
    )
      setDownHold("ready");
    if (downHold === "released") return false;
    const stickyDistance = Math.max(0, scene.offsetHeight - stage.offsetHeight);
    if (current > anchor + stickyDistance + 2) return false;
    const target =
      Math.max(
        current,
        Number.isFinite(lenis.targetScroll) ? lenis.targetScroll : current,
      ) + delta;
    if (target < anchor) return false;
    block(event);
    beginEntry(anchor);
    return true;
  }

  window.addEventListener(
    "wheel",
    (event) => {
      touchDirection = 0;
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      const now = performance.now(),
        fresh = now - lastWheelAt >= 220;
      lastWheelAt = now;
      if (!enterDown(delta, event, "wheel", fresh)) leave(delta, event);
    },
    { capture: true, passive: false },
  );
  window.addEventListener(
    "keydown",
    (event) => {
      touchDirection = 0;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (entryMode() && (event.key === "Escape" || event.key === "Tab")) {
        releaseEntry();
        return;
      }
      const delta =
        event.key === "ArrowUp"
          ? -80
          : event.key === "PageUp" || (event.key === " " && event.shiftKey)
            ? -innerHeight * 0.8
            : event.key === "Home"
              ? -scrollY
              : event.key === "ArrowDown"
                ? 80
                : event.key === "PageDown" || event.key === " "
                  ? innerHeight * 0.9
                  : 0;
      if (delta && !enterDown(delta, event, "key", !event.repeat))
        leave(delta, event, event.key === "Home" ? 0 : undefined);
    },
    { capture: true, passive: false },
  );
  window.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      touchSequence++;
      lastTouchY = event.touches[0].clientY;
      touchDirection = 0;
      touchExcluded = !!excluded(event.target);
      lastTouchAt = performance.now();
    },
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 1) return;
      const y = event.touches[0].clientY,
        delta = lastTouchY - y;
      lastTouchY = y;
      if (Math.abs(delta) > 0.5) touchDirection = Math.sign(delta);
      lastTouchAt = performance.now();
      if (!enterDown(delta, event, "touch", touchSequence > heldTouchSequence))
        leave(delta, event);
    },
    { capture: true, passive: false },
  );
  window.addEventListener(
    "touchend",
    () => {
      lastTouchAt = performance.now();
    },
    { passive: true },
  );
  // Prevent residual native touch momentum from shifting the held fold frame.
  window.addEventListener(
    "scroll",
    () => {
      const current = Math.max(scrollY, 0),
        previous = lastObservedY;
      lastObservedY = current;
      if (entryMode()) {
        if (entryAligned || mode === "held") {
          if (Math.abs(current - holdY) > 0.5)
            lenis.scrollTo(holdY, { immediate: true, force: true });
        } else if (current > entryAnchor + 1) {
          lenis.scrollTo(entryAnchor, { immediate: true, force: true });
          entryAligned = true;
          holdY = scrollY;
          finishEntry();
        }
        return;
      }
      if (mode === "closing") {
        if (Math.abs(current - holdY) > 0.5)
          lenis.scrollTo(holdY, { immediate: true, force: true });
        return;
      }
      if (
        mode === "idle" &&
        !touchExcluded &&
        touchDirection > 0 &&
        performance.now() - lastTouchAt < 1500 &&
        current > previous + 0.5
      ) {
        if (
          enterDown(Math.max(80, current - previous), undefined, "touch", false)
        )
          return;
      }
      // A native mobile fling can outlive its cancelable touch events; catch it before the boundary.
      if (
        mode === "idle" &&
        !touchExcluded &&
        touchDirection < 0 &&
        performance.now() - lastTouchAt < 1500 &&
        current < previous - 0.5
      ) {
        leave(-Math.max(80, previous - current), undefined, undefined, true);
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "click",
    (event) => {
      if (
        entryMode() &&
        event.target instanceof Element &&
        event.target.closest("a[href], button")
      )
        cancel();
    },
    { capture: true },
  );
  document.querySelector(".express-top-btn")?.addEventListener("click", cancel);
  window.addEventListener("resize", cancel, { passive: true });
  reduced.addEventListener("change", cancel);
}

// Use the same clipped capsule-to-full-surface entrance as JW's contact section.
function timeSaleExpansion__init() {
  const scene = document.querySelector(".sale-scene");
  const stage = scene?.querySelector(".sale-stage");
  const surface = stage?.querySelector(".time-sale-wrapper");
  const heading = surface?.querySelector(".top-box");
  const products = surface?.querySelector(".bottom-box");
  if (!scene || !stage || !surface || !heading || !products) return;
  const titleInk = document.createElement("canvas").getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const motion = { expand: reduced.matches ? 1 : 0 };
  const clamp = gsap.utils.clamp(0, 1);
  let expanded = reduced.matches,
    started = false,
    frame = 0,
    measureFrame = 0;
  let exiting = false,
    exitGeneration = 0,
    lastScroll = Math.max(scrollY, 0);
  let geometry = {
    width: 0,
    height: 0,
    viewport: 0,
    headingCenter: 0,
    headerGapLift: 0,
  };

  function draw() {
    const p = motion.expand;
    const { width, height, viewport, headingCenter, headerGapLift } = geometry;
    const top = viewport * 0.29 * (1 - p);
    const bottom = Math.max(0, height - viewport * 0.71) * (1 - p);
    const insetX = width * (width <= 767 ? 0.08 : 0.1875) * (1 - p);
    const radius = Math.min(viewport * 0.21, 220) * (1 - p);
    const content = clamp((p - 0.45) / 0.55);
    surface.style.clipPath = `inset(${top}px ${insetX}px ${bottom}px round ${radius}px)`;
    surface.style.setProperty("--sale-clip-top", `${top}px`);
    surface.style.setProperty("--sale-clip-bottom", `${bottom}px`);
    surface.style.setProperty(
      "--sale-heading-y",
      `${(viewport * 0.5 - headingCenter) * (1 - p) - headerGapLift * p}px`,
    );
    surface.style.setProperty("--sale-products-opacity", content.toFixed(4));
    surface.style.setProperty(
      "--sale-products-y",
      `${48 * (1 - content) - headerGapLift * p}px`,
    );
    surface.style.setProperty("--sale-detail-opacity", content.toFixed(4));
    scene.dataset.expandProgress = p.toFixed(4);
    const hidden = p < 0.72;
    if (products.inert !== hidden) products.inert = hidden;
    document
      .querySelector("header")
      ?.dispatchEvent(new Event("oliveyoung:sale-surface"));
  }
  function paint() {
    frame = 0;
    if (!started) return;
    const current = Math.max(scrollY, 0);
    const sceneTop = scene.getBoundingClientRect().top;
    if (
      exiting &&
      scene.dataset.exitState === "leaving" &&
      (sceneTop > innerHeight * 0.2 || current > lastScroll + 0.5)
    ) {
      exiting = false;
      delete scene.dataset.exitState;
    }
    lastScroll = current;
    const shouldExpand =
      reduced.matches || (!exiting && sceneTop <= innerHeight * 0.2);
    if (expanded === shouldExpand) return;
    expanded = shouldExpand;
    if (expanded) scene.dispatchEvent(new Event("oliveyoung:sale-opening"));
    gsap.to(motion, {
      expand: expanded ? 1 : 0,
      duration: reduced.matches ? 0 : 1.2,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: draw,
      onComplete() {
        if (expanded && motion.expand >= 0.999)
          scene.dispatchEvent(new Event("oliveyoung:sale-expanded"));
      },
    });
  }
  scene.addEventListener("oliveyoung:sale-leave", (event) => {
    const run = ++exitGeneration;
    exiting = true;
    expanded = false;
    scene.dataset.exitState = "shrinking";
    gsap.to(motion, {
      expand: 0,
      duration: reduced.matches ? 0 : 1,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: draw,
      onComplete() {
        if (run !== exitGeneration) return;
        scene.dataset.exitState = "leaving";
        event.detail.resume();
      },
    });
  });
  scene.addEventListener("oliveyoung:sale-leave-cancel", () => {
    exitGeneration++;
    exiting = false;
    expanded = false;
    delete scene.dataset.exitState;
    gsap.killTweensOf(motion);
    requestPaint();
  });
  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  scene.addEventListener("oliveyoung:sale-enter", requestPaint);
  function measure() {
    measureFrame = 0;
    const viewport = document.documentElement.clientHeight;
    const headerHeight = document.querySelector("header")?.offsetHeight || 0;
    surface.style.setProperty("--sale-header-height", `${headerHeight}px`);
    const height = surface.offsetHeight;
    const label = heading.querySelector(".time-sale > span");
    const labelStyle = getComputedStyle(label);
    titleInk.font = `${labelStyle.fontWeight} ${labelStyle.fontSize} ${labelStyle.fontFamily}`;
    const ink = titleInk.measureText(label.textContent);
    const ascent = ink.fontBoundingBoxAscent ?? ink.actualBoundingBoxAscent;
    const descent = ink.fontBoundingBoxDescent ?? ink.actualBoundingBoxDescent;
    const inkTop =
      (parseFloat(labelStyle.lineHeight) - ascent - descent) / 2 +
      ascent -
      ink.actualBoundingBoxAscent;
    geometry = {
      width: stage.clientWidth,
      height,
      viewport,
      headingCenter: heading.offsetTop + heading.offsetHeight / 2,
      // Keep 25% of the visible header-to-title gap, including the font's leading.
      headerGapLift:
        Math.max(
          0,
          heading.offsetTop + label.offsetTop + inkTop - headerHeight,
        ) * 0.75,
    };
    const tall = height > viewport + 2 || innerWidth <= 767;
    scene.classList.toggle("is-tall", tall);
    const sceneHeight = height + (tall ? 0 : viewport * 0.35);
    if (Math.abs(scene.offsetHeight - sceneHeight) > 1) {
      scene.style.height = `${sceneHeight}px`;
      if (started) requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    draw();
    requestPaint();
  }
  function requestMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }
  function start() {
    started = true;
    measure();
    document.fonts.ready.then(requestMeasure);
    ScrollTrigger.refresh();
  }
  addEventListener("scroll", requestPaint, { passive: true });
  addEventListener("resize", requestMeasure, { passive: true });
  new ResizeObserver(requestMeasure).observe(surface);
  new ResizeObserver(requestMeasure).observe(heading);
  reduced.addEventListener("change", () => {
    expanded = !reduced.matches;
    requestPaint();
  });
  measure();
  if (document.querySelector(".loading-page")?.style.display === "none")
    start();
  else document.addEventListener("oliveyoung:ready", start, { once: true });
}

// Two tiny ball-like hops on each real hover; the extra hit area stays comfortable.
function topButtonBounce__init() {
  const button = document.querySelector(".express-top-btn");
  if (!button) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let bounce;
  function stop() {
    bounce?.cancel();
    bounce = undefined;
  }
  function play(event) {
    if (reduced.matches || event.pointerType === "touch") return;
    stop();
    const animation = button.animate(
      [
        {
          translate: "0 0",
          offset: 0,
          easing: "cubic-bezier(0.2, 0.7, 0.4, 1)",
        },
        {
          translate: "0 -3px",
          offset: 0.28,
          easing: "cubic-bezier(0.55, 0, 0.9, 0.5)",
        },
        {
          translate: "0 0",
          offset: 0.5,
          easing: "cubic-bezier(0.2, 0.7, 0.4, 1)",
        },
        {
          translate: "0 -1.8px",
          offset: 0.72,
          easing: "cubic-bezier(0.55, 0, 0.9, 0.5)",
        },
        { translate: "0 0", offset: 0.92 },
        { translate: "0 0", offset: 1 },
      ],
      { duration: 620, easing: "linear" },
    );
    animation.id = "top-hover-bounce";
    bounce = animation;
    animation.onfinish = () => {
      animation.cancel();
      if (bounce === animation) bounce = undefined;
    };
  }
  button.addEventListener("pointerenter", play);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
  reduced.addEventListener("change", (event) => {
    if (event.matches) stop();
  });
}

// Mobile header uses a native modal for focus containment and a right-side slide.
function mobileHeader__init() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;
  const mobile = matchMedia("(max-width: 768px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const closeButton = menu.querySelector(".mobile-menu__close");
  let closeTimer,
    closeSpin,
    closing = false;
  function cancelCloseSpin() {
    closeSpin?.cancel();
    closeSpin = undefined;
  }
  function finishClose(restoreFocus = true) {
    cancelCloseSpin();
    clearTimeout(closeTimer);
    closing = false;
    menu.classList.remove("is-open");
    if (menu.open) menu.close();
    root.classList.remove("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus && mobile.matches) toggle.focus({ preventScroll: true });
  }
  function close() {
    if (!menu.open || closing) return;
    cancelCloseSpin();
    closing = true;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    closeTimer = setTimeout(() => finishClose(), reduced.matches ? 0 : 340);
  }
  function open() {
    if (!mobile.matches) return;
    cancelCloseSpin();
    clearTimeout(closeTimer);
    closing = false;
    if (!menu.open) menu.showModal();
    root.classList.add("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      if (menu.open && mobile.matches && !closing)
        menu.classList.add("is-open");
    });
    menu.querySelector(".mobile-menu__close").focus({ preventScroll: true });
  }
  toggle.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  closeButton.addEventListener("pointerenter", (event) => {
    if (
      event.pointerType === "touch" ||
      reduced.matches ||
      !menu.open ||
      closing ||
      closeSpin
    )
      return;
    const animation = closeButton.animate(
      [{ rotate: "0deg" }, { rotate: "-360deg" }],
      {
        duration: 480,
        easing: "ease-in-out",
      },
    );
    closeSpin = animation;
    animation.finished
      .then(() => {
        if (closeSpin === animation) closeSpin = undefined;
      })
      .catch(() => {});
  });
  menu.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const items = [...menu.querySelectorAll("a[href], button, input")].filter(
      (e) => !e.disabled && e.getClientRects().length,
    );
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  menu.addEventListener("click", (event) => {
    const box = menu.getBoundingClientRect();
    if (
      event.target === menu &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      close();
    // The existing header links are portfolio placeholders with navigation disabled.
    if (event.target.closest('a[href="#"]')) event.preventDefault();
  });
  menu
    .querySelector("form")
    .addEventListener("submit", (event) => event.preventDefault());
  mobile.addEventListener("change", () => {
    if (!mobile.matches) finishClose(false);
  });
}

// Keep only the header logo and the dedicated TOP button as return-to-top controls.
function placeholderLinks__init() {
  document.addEventListener("click", (event) => {
    const link =
      event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || link.matches("header .logo-wrapper")) return;
    event.preventDefault();
  });
}

// Functions Operate Key ------------------------------ //
placeholderLinks__init();
loadingPage__init();
bannerSwiper__init();
scrollLeins__init();
marqueeSlide__init();
heartDown__init();
timeSaleCountdown__init();
itemsSwiper__Init();
itemboxViewer__init();
shortbtnDropdown__init();
bottomSelectboxDropDown__init();
headerChangeOnSection__init();

sectionReveal__init();
appBannerParallax__init();

footerLift__init();

timeSaleExpansion__init();

topButtonBounce__init();

mobileHeader__init();
