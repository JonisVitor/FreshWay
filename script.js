gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const video = document.querySelector(".hero-video");
let heroVideoProgress = 0;
let heroVideoTargetTime = 0;
let heroVideoReady = false;
let heroVideoWasScrolling = false;
let heroVideoScrollTimer;

const seekHeroVideo = () => {
  if (!video || !video.duration) return;
  heroVideoTargetTime = Math.min(video.duration - 0.03, Math.max(0, video.duration * heroVideoProgress));
};

const updateHeroVideoFrame = () => {
  if (!video || !video.duration || !heroVideoReady) return;

  const diff = heroVideoTargetTime - video.currentTime;
  const absDiff = Math.abs(diff);

  if (diff > 0.04) {
    video.playbackRate = gsap.utils.clamp(0.75, 2.35, diff * 1.65);
    if (video.paused) {
      video.play().catch(() => {});
    }
    return;
  }

  if (diff < -0.08) {
    video.pause();
    video.currentTime += diff * 0.22;
    return;
  }

  if (!heroVideoWasScrolling && absDiff < 0.08) {
    video.pause();
  }
};

const markHeroVideoScrolling = () => {
  heroVideoWasScrolling = true;
  clearTimeout(heroVideoScrollTimer);
  heroVideoScrollTimer = setTimeout(() => {
    heroVideoWasScrolling = false;
  }, 90);
};

if (video) {
  video.load();
  video.pause();
  video.currentTime = 0;
  video.addEventListener("loadedmetadata", () => {
    video.pause();
    video.currentTime = 0;
    heroVideoTargetTime = 0;
    heroVideoReady = true;
    seekHeroVideo();
  });
  video.addEventListener("canplay", () => {
    video.pause();
    heroVideoReady = true;
    seekHeroVideo();
  });
  video.play().then(() => video.pause()).catch(() => {});
}

if (!prefersReducedMotion) {
  gsap.set(".hero-message", { autoAlpha: 0, y: 42 });
  if (video) {
    gsap.ticker.add(updateHeroVideoFrame);
  }

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      pin: ".hero-pin",
      anticipatePin: 1,
      onUpdate: (self) => {
        heroVideoProgress = Math.min(self.progress / 0.98, 1);
        markHeroVideoScrolling();
        seekHeroVideo();
        updateHeroVideoFrame();

        document
          .querySelector(".site-header")
          ?.classList.toggle("is-visible", self.progress > 0.86);
      },
    },
  });

  heroTl
    .fromTo(
      ".hero-video",
      { scale: 1.04, borderRadius: "0px" },
      { scale: 1, borderRadius: "0px", duration: 0.9, ease: "none" },
      0
    )
    .to(".hero-video", { scale: 1.015, filter: "saturate(1.12) contrast(1.12)", duration: 0.08 }, 0.92)
    .to(".hero-message", { autoAlpha: 1, y: 0, duration: 0.1, ease: "power3.out" }, 0.9);

  gsap.utils.toArray(".reveal").forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 92%",
      },
      autoAlpha: 0,
      y: 28,
      duration: 0.55,
      ease: "power3.out",
    });
  });

  const storySteps = gsap.utils.toArray(".story-step");
  const storyProgressFill = document.querySelector(".story-progress-line span");
  const updateStoryProgress = (progress) => {
    const activeIndex = Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length + 0.0001));

    storySteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === activeIndex);
      step.classList.toggle("is-past", index < activeIndex);
    });

    if (storyProgressFill) {
      gsap.set(storyProgressFill, { height: `${progress * 100}%`, width: "100%" });
    }
  };

  gsap.set(storySteps, { y: 22 });
  gsap.set(storySteps[0], { y: 0 });

  const storyTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.8,
      pin: ".story-pin",
      anticipatePin: 1,
      onUpdate: (self) => updateStoryProgress(self.progress),
    },
  });

  storyTl
    .fromTo(
      ".story-sandwich",
      { y: "-28vh", rotationY: 0, rotationZ: -4, scale: 1, autoAlpha: 1 },
      { y: "32vh", rotationY: 360, rotationZ: 4, scale: 1.04, autoAlpha: 1, duration: 1, ease: "none" },
      0
    )
    .to(storySteps, { y: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" }, 0);

  updateStoryProgress(0);

  gsap.to(".parallax-wrap img", {
    yPercent: -14,
    ease: "none",
    scrollTrigger: {
      trigger: ".split-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

} else {
  document.querySelector(".site-header")?.classList.add("is-visible");
}

document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    card.style.transform = `translateY(-14px) rotateX(${(-y / rect.height) * 2.2}deg) rotateY(${(x / rect.width) * 2.2}deg) scale(1.045)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});
