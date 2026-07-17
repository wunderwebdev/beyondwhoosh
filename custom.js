let lenisInstance = null;
document.addEventListener("DOMContentLoaded", function () {
  startScroll();
  initAnimationBorder();
  initMegaNavDirectionalHover();
  initContentRevealScroll();
  splitLinesAnimation();
  initCurveScroll();
  initVideoTileScroll();
  initAccordionCSS();
  initDynamicCurrentYear();
  typewriterPlaceholder();
  initLinkIndicator();
  initReadmoreDescription();
});
// Locomotive Scroll (with GSAP ScrollTrigger)
const locomotiveScroll = new LocomotiveScroll({
  initCustomTicker: (render) => {
    gsap.ticker.add(render);
  },
  destroyCustomTicker: (render) => {
    gsap.ticker.remove(render);
  },
  scrollCallback: () => {
    ScrollTrigger.update();
  },
});

// Disable lag smoothing to avoid any delay in scroll animations
gsap.ticker.lagSmoothing(0);

// Recalculate ScrollTrigger positions now that Locomotive Scroll has initialized
ScrollTrigger.refresh();

// Scroll-To Anchor on Page Load (runs on the destination page if URL has a hash,
// e.g. arriving via a regular <a href="/page2#orange"> link from another page)
function initScrollToAnchorOnLoad() {
  if (window.location.hash) {
    const targetScrollToAnchorOnLoad = window.location.hash;

    requestAnimationFrame(() => {
      locomotiveScroll.scrollTo(targetScrollToAnchorOnLoad, {
        easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
        duration: 1.2,
        offset: 0,
      });
    });
  }
}

// Start Scroll
function startScroll() {
  locomotiveScroll.start();
}

// Stop Scroll
function stopScroll() {
  locomotiveScroll.stop();
}

const debounce = (fn, wait = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
};
function initMegaNavDirectionalHover() {
  const DUR = { bgMorph: 0.4, contentIn: 0.3, contentOut: 0.2, stagger: 0.25, backdropIn: 0.3, backdropOut: 0.2, openScale: 0.35, closeScale: 0.25 };
  const HOVER_ENTER = 120;
  const HOVER_LEAVE = 150;
  const menuWrap = document.querySelector("[data-menu-wrap]");
  const navList = document.querySelector("[data-nav-list]");
  const dropWrapper = document.querySelector("[data-dropdown-wrapper]");
  const dropContainer = document.querySelector("[data-dropdown-container]");
  const dropBg = document.querySelector("[data-dropdown-bg]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const toggles = [...document.querySelectorAll("[data-dropdown-toggle]")];
  const panels = [...document.querySelectorAll("[data-nav-content]")];
  const burger = document.querySelector("[data-burger-toggle]");
  if (!menuWrap || !dropWrapper || !burger) return;
  const backBtn = document.querySelector("[data-mobile-back]");
  const logo = document.querySelector("[data-menu-logo]");
  const [lineTop, lineMid, lineBot] = ["top", "mid", "bot"].map((id) => document.querySelector(`[data-burger-line='${id}']`));
  const state = { isOpen: !1, activePanel: null, activePanelIndex: -1, isMobile: window.innerWidth <= 991, mobileMenuOpen: !1, mobilePanelActive: null, hoverTimer: null, leaveTimer: null, tl: null, mobileTl: null, mobilePanelTl: null };
  const getPanel = (name) => document.querySelector(`[data-nav-content="${name}"]`);
  const getToggle = (name) => document.querySelector(`[data-dropdown-toggle="${name}"]`);
  const getFade = (el) => el.querySelectorAll("[data-menu-fade]");
  const getNavItems = () => navList.querySelectorAll("[data-nav-list-item]");
  const getIndex = (name) => toggles.indexOf(getToggle(name));
  const stagger = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });
  function clearTimers() {
    clearTimeout(state.hoverTimer);
    clearTimeout(state.leaveTimer);
    state.hoverTimer = state.leaveTimer = null;
  }
  function killTl(key) {
    if (state[key]) {
      state[key].kill();
      state[key] = null;
    }
  }
  function killDropdown() {
    killTl("tl");
    gsap.killTweensOf(dropContainer);
    gsap.killTweensOf(backdrop);
    panels.forEach((p) => {
      gsap.killTweensOf(p);
      gsap.killTweensOf(getFade(p));
    });
  }
  function killMobile() {
    killTl("mobileTl");
    gsap.killTweensOf([navList, lineTop, lineMid, lineBot]);
  }
  function killMobilePanel() {
    killTl("mobilePanelTl");
    gsap.killTweensOf(getNavItems());
    gsap.killTweensOf([backBtn, logo]);
    panels.forEach((p) => {
      gsap.killTweensOf(p);
      gsap.killTweensOf(getFade(p));
    });
  }
  function resetToggles() {
    toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
  }
  function resetDesktop() {
    panels.forEach((p) => {
      gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 });
      gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 });
    });
    gsap.set(dropContainer, { height: 0 });
    gsap.set(backdrop, { autoAlpha: 0 });
    menuWrap.setAttribute("data-menu-open", "false");
    resetToggles();
  }
  function setupMobile() {
    panels.forEach((p) => {
      gsap.set(p, { autoAlpha: 0, xPercent: 0, visibility: "visible", pointerEvents: "none" });
      gsap.set(getFade(p), { xPercent: 20, autoAlpha: 0 });
    });
    gsap.set(getNavItems(), { xPercent: 0, y: 0, autoAlpha: 1 });
    gsap.set(navList, { autoAlpha: 0, x: 0 });
    gsap.set(backBtn, { autoAlpha: 0 });
    gsap.set(logo, { autoAlpha: 1 });
    gsap.set(dropContainer, { clearProps: "height" });
    gsap.set(backdrop, { autoAlpha: 0 });
  }
  function measurePanel(name) {
    const el = getPanel(name);
    if (!el) return 0;
    const s = el.style;
    const prev = [s.visibility, s.opacity, s.pointerEvents];
    Object.assign(s, { visibility: "visible", opacity: "0", pointerEvents: "none" });
    const h = el.getBoundingClientRect().height;
    [s.visibility, s.opacity, s.pointerEvents] = prev;
    return h;
  }
  function openDropdown(panelName) {
    if (state.isOpen && state.activePanel === panelName) return;
    if (state.isOpen) return switchPanel(state.activePanel, panelName);
    const height = measurePanel(panelName);
    if (!height) return;
    killDropdown();
    resetDesktop();
    const el = getPanel(panelName);
    const fade = getFade(el);
    const toggle = getToggle(panelName);
    state.isOpen = !0;
    state.activePanel = panelName;
    state.activePanelIndex = getIndex(panelName);
    menuWrap.setAttribute("data-menu-open", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    gsap.set(dropContainer, { height: 0 });
    const tl = gsap.timeline();
    state.tl = tl;
    tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: "power2.out" }, 0);
    tl.to(dropContainer, { height, duration: DUR.openScale, ease: "power3.out" }, 0);
    tl.set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
    if (fade.length) {
      tl.fromTo(fade, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stagger(fade.length), ease: "power3.out" }, 0.1);
    }
  }
  function closeDropdown() {
    if (!state.isOpen) return;
    const el = getPanel(state.activePanel);
    const fade = el ? getFade(el) : [];
    killDropdown();
    const tl = gsap.timeline({
      onComplete() {
        state.isOpen = !1;
        state.activePanel = null;
        state.activePanelIndex = -1;
        state.tl = null;
        resetDesktop();
      },
    });
    state.tl = tl;
    if (fade.length) tl.to(fade, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
    tl.to(dropContainer, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05);
    tl.to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: "power2.out" }, 0);
    if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
  }
  function switchPanel(fromName, toName) {
    const dir = getIndex(toName) > getIndex(fromName) ? 1 : -1;
    const fromEl = getPanel(fromName),
      toEl = getPanel(toName);
    if (!fromEl || !toEl) return;
    const fromFade = getFade(fromEl),
      toFade = getFade(toEl);
    const toHeight = measurePanel(toName);
    if (!toHeight) return;
    killDropdown();
    panels.forEach((p) => {
      gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 });
      gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 });
    });
    gsap.set(fromEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", x: 0 });
    if (fromFade.length) gsap.set(fromFade, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(backdrop, { autoAlpha: 1 });
    const toToggle = getToggle(toName);
    state.activePanel = toName;
    state.activePanelIndex = getIndex(toName);
    resetToggles();
    if (toToggle) toToggle.setAttribute("aria-expanded", "true");
    const xOut = dir * -30,
      xIn = dir * 30;
    const tl = gsap.timeline();
    state.tl = tl;
    if (fromFade.length) tl.to(fromFade, { autoAlpha: 0, x: xOut, duration: DUR.contentOut, ease: "power2.in" }, 0);
    tl.set(fromEl, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }, DUR.contentOut);
    if (fromFade.length) tl.set(fromFade, { x: 0 }, DUR.contentOut);
    tl.to(dropContainer, { height: toHeight, duration: DUR.bgMorph, ease: "power3.out" }, 0.05);
    tl.set(toEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", xPercent: 0 }, DUR.contentOut * 0.5);
    if (toFade.length) {
      tl.fromTo(toFade, { autoAlpha: 0, x: xIn }, { autoAlpha: 1, x: 0, duration: DUR.contentIn, stagger: stagger(toFade.length), ease: "power3.out" }, DUR.contentOut * 0.6);
    }
  }
  function handleToggleEnter(e) {
    if (state.isMobile) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");
    if (!name) return;
    clearTimeout(state.leaveTimer);
    state.leaveTimer = null;
    clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(() => openDropdown(name), state.isOpen ? 0 : HOVER_ENTER);
  }
  function handleToggleLeave() {
    if (state.isMobile) return;
    clearTimeout(state.hoverTimer);
    state.hoverTimer = null;
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
  }
  function handleWrapperEnter() {
    if (state.isMobile) return;
    clearTimeout(state.leaveTimer);
    state.leaveTimer = null;
  }
  function handleWrapperLeave() {
    if (state.isMobile) return;
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
  }
  function handleEscape(e) {
    if (e.key !== "Escape") return;
    if (state.isMobile) {
      state.mobilePanelActive ? closeMobilePanel() : state.mobileMenuOpen && closeMobileMenu();
      return;
    }
    if (state.isOpen) {
      const t = getToggle(state.activePanel);
      closeDropdown();
      if (t) t.focus();
    }
  }
  function handleDocClick(e) {
    if (state.isMobile || !state.isOpen) return;
    if (!e.target.closest("[data-menu-wrap]")) closeDropdown();
  }
  function focusFirstLink(panelName) {
    setTimeout(() => {
      const el = getPanel(panelName);
      if (!el) return;
      const link = el.querySelector("a");
      if (!link) return;
      gsap.set(link, { visibility: "visible" });
      link.focus();
    }, 80);
  }
  function handleKeydownOnToggle(e) {
    if (state.isMobile) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.isOpen && state.activePanel === name) closeDropdown();
      else {
        openDropdown(name);
        focusFirstLink(name);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!state.isOpen || state.activePanel !== name) openDropdown(name);
      focusFirstLink(name);
    }
    if (e.key === "Tab" && !e.shiftKey && state.isOpen && state.activePanel === name) {
      e.preventDefault();
      const link = getPanel(name)?.querySelector("a");
      if (link) link.focus();
    }
  }
  function handleKeydownInPanel(e) {
    if (state.isMobile || !state.isOpen) return;
    const el = getPanel(state.activePanel);
    if (!el) return;
    const links = [...el.querySelectorAll("a")];
    const idx = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      links[(idx + 1) % links.length].focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx <= 0) {
        const t = getToggle(state.activePanel);
        if (t) t.focus();
      } else links[idx - 1].focus();
    }
    if (e.key === "Tab" && !e.shiftKey && idx === links.length - 1) {
      e.preventDefault();
      const curIdx = toggles.indexOf(getToggle(state.activePanel));
      const next = curIdx < toggles.length - 1 ? toggles[curIdx + 1] : null;
      closeDropdown();
      if (next) next.focus();
    }
    if (e.key === "Tab" && e.shiftKey && idx === 0) {
      e.preventDefault();
      const t = getToggle(state.activePanel);
      if (t) t.focus();
    }
  }
  function animateBurger(toX) {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    if (toX) {
      tl.to(lineTop, { y: "0.3125em", duration: 0.15 }, 0);
      tl.to(lineBot, { y: "-0.3125em", duration: 0.15 }, 0);
      tl.to(lineMid, { autoAlpha: 0, duration: 0.1 }, 0.1);
      tl.to(lineTop, { rotation: 45, duration: 0.2 }, 0.15);
      tl.to(lineBot, { rotation: -45, duration: 0.2 }, 0.15);
    } else {
      tl.to(lineTop, { rotation: 0, duration: 0.2 }, 0);
      tl.to(lineBot, { rotation: 0, duration: 0.2 }, 0);
      tl.to(lineTop, { y: 0, duration: 0.15 }, 0.15);
      tl.to(lineBot, { y: 0, duration: 0.15 }, 0.15);
      tl.to(lineMid, { autoAlpha: 1, duration: 0.1 }, 0.15);
    }
    return tl;
  }
  function openMobileMenu() {
    killMobile();
    state.mobileMenuOpen = !0;
    menuWrap.setAttribute("data-menu-open", "true");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (lenisInstance) lenisInstance.stop();
    const items = getNavItems();
    const tl = gsap.timeline();
    state.mobileTl = tl;
    tl.add(animateBurger(!0), 0);
    tl.to(navList, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
    if (items.length) {
      tl.fromTo(items, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 0.15);
    }
  }
  function closeMobileMenu() {
    const hadPanel = state.mobilePanelActive;
    const panelEl = hadPanel ? getPanel(hadPanel) : null;
    killMobile();
    killMobilePanel();
    menuWrap.setAttribute("data-menu-open", "false");
    state.mobileMenuOpen = !1;
    state.mobilePanelActive = null;
    burger.setAttribute("aria-expanded", "false");
    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = "";
        if (lenisInstance) lenisInstance.start();
        state.mobileTl = null;
        setupMobile();
      },
    });
    state.mobileTl = tl;
    tl.add(animateBurger(!1), 0);
    if (hadPanel && panelEl) {
      tl.to(panelEl, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
      tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.05);
    }
    tl.to(navList, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
  }
  function openMobilePanel(panelName) {
    const el = getPanel(panelName);
    if (!el) return;
    killMobilePanel();
    state.mobilePanelActive = panelName;
    const navItems = getNavItems();
    const panelFade = getFade(el);
    const tl = gsap.timeline();
    state.mobilePanelTl = tl;
    if (navItems.length) {
      tl.to(navItems, { xPercent: -10, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0);
    }
    tl.to(burger, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
    tl.to(backBtn, { autoAlpha: 1, duration: 0.25, ease: "power2.inOut" }, 0.15);
    tl.set(el, { autoAlpha: 1, xPercent: 0, pointerEvents: "auto" }, 0.2);
    if (panelFade.length) {
      tl.fromTo(panelFade, { xPercent: 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.3, stagger: stagger(panelFade.length), ease: "power3.out" }, 0.25);
    }
  }
  function closeMobilePanel() {
    if (!state.mobilePanelActive) return;
    const el = getPanel(state.mobilePanelActive);
    if (!el) return;
    killMobilePanel();
    const navItems = getNavItems();
    const panelFade = getFade(el);
    const tl = gsap.timeline({
      onComplete() {
        state.mobilePanelActive = null;
        state.mobilePanelTl = null;
      },
    });
    state.mobilePanelTl = tl;
    if (panelFade.length) {
      tl.to(el, { xPercent: 20, autoAlpha: 0, duration: 0.3, stagger: 0.02, ease: "power2.in" }, 0);
    }
    tl.set(el, { autoAlpha: 0, pointerEvents: "none" }, 0.25);
    tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
    tl.to(burger, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15);
    tl.to(logo, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15);
    if (navItems.length) {
      tl.fromTo(navItems, { xPercent: -20, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: "power3.out" }, 0.25);
    }
  }
  function handleToggleClick(e) {
    if (!state.isMobile || !state.mobileMenuOpen) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");
    if (name) {
      e.preventDefault();
      openMobilePanel(name);
    }
  }
  let resizeTimer = null;
  let lastWidth = window.innerWidth;
  function handleResize() {
    const w = window.innerWidth;
    if (w === lastWidth) return;
    lastWidth = w;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const was = state.isMobile;
      state.isMobile = window.innerWidth <= 991;
      if (was && !state.isMobile) {
        killMobile();
        killMobilePanel();
        gsap.set(navList, { clearProps: "all" });
        gsap.set(getNavItems(), { clearProps: "all" });
        gsap.set(backBtn, { autoAlpha: 0 });
        gsap.set(logo, { clearProps: "all" });
        gsap.set([lineTop, lineMid, lineBot], { rotation: 0, y: 0, autoAlpha: 1 });
        panels.forEach((p) => {
          gsap.set(p, { clearProps: "all" });
          gsap.set(getFade(p), { clearProps: "all" });
        });
        burger.setAttribute("aria-expanded", "false");
        state.mobileMenuOpen = !1;
        state.mobilePanelActive = null;
        document.body.style.overflow = "";
        resetDesktop();
      }
      if (!was && state.isMobile) {
        killDropdown();
        state.isOpen = !1;
        state.activePanel = null;
        state.activePanelIndex = -1;
        clearTimers();
        menuWrap.setAttribute("data-menu-open", "false");
        resetToggles();
        setupMobile();
      }
    }, 150);
  }
  toggles.forEach((btn) => {
    btn.addEventListener("mouseenter", handleToggleEnter);
    btn.addEventListener("mouseleave", handleToggleLeave);
    btn.addEventListener("keydown", handleKeydownOnToggle);
    btn.addEventListener("click", handleToggleClick);
  });
  dropWrapper.addEventListener("mouseenter", handleWrapperEnter);
  dropWrapper.addEventListener("mouseleave", handleWrapperLeave);
  panels.forEach((p) => p.addEventListener("keydown", handleKeydownInPanel));
  backdrop.addEventListener("click", closeDropdown);
  document.addEventListener("keydown", handleEscape);
  document.addEventListener("click", handleDocClick);
  burger.addEventListener("click", () => (state.mobileMenuOpen ? closeMobileMenu() : openMobileMenu()));
  backBtn.addEventListener("click", closeMobilePanel);
  window.addEventListener("resize", handleResize);
  state.isMobile ? setupMobile() : resetDesktop();
}
function initDynamicCurrentYear() {
  const currentYear = new Date().getFullYear();
  const currentYearElements = document.querySelectorAll("[data-current-year]");
  currentYearElements.forEach((currentYearElement) => {
    currentYearElement.textContent = `© ${currentYear}`;
  });
}
function initContentRevealScroll() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = gsap.context(() => {
    document.querySelectorAll("[data-reveal-group]").forEach((groupEl) => {
      const groupStaggerSec = (parseFloat(groupEl.getAttribute("data-stagger")) || 100) / 1000;
      const groupDistance = groupEl.getAttribute("data-distance") || "2em";
      const triggerStart = groupEl.getAttribute("data-start") || "top 80%";
      const animDuration = 1;
      const animEase = "power4.inOut";
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: "all", y: 0, autoAlpha: 1 });
        return;
      }
      const directChildren = Array.from(groupEl.children).filter((el) => el.nodeType === 1);
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({ trigger: groupEl, start: triggerStart, once: !0, onEnter: () => gsap.to(groupEl, { y: 0, autoAlpha: 1, duration: animDuration, ease: animEase, onComplete: () => gsap.set(groupEl, { clearProps: "all" }) }) });
        return;
      }
      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches("[data-reveal-group-nested]") ? child : child.querySelector(":scope [data-reveal-group-nested]");
        if (nestedGroup) {
          const includeParent = child.getAttribute("data-ignore") !== "true" && (child.getAttribute("data-ignore") === "false" || nestedGroup.getAttribute("data-ignore") === "false");
          const nestedChildren = Array.from(nestedGroup.children).filter((el) => el.nodeType === 1 && el.getAttribute("data-ignore") !== "true");
          slots.push({ type: "nested", parentEl: child, nestedEl: nestedGroup, includeParent, nestedChildren });
        } else {
          if (child.getAttribute("data-ignore") === "true") return;
          slots.push({ type: "item", el: child });
        }
      });
      slots.forEach((slot) => {
        if (slot.type === "item") {
          const isNestedSelf = slot.el.matches("[data-reveal-group-nested]");
          const d = isNestedSelf ? groupDistance : slot.el.getAttribute("data-distance") || groupDistance;
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          const nestedD = slot.nestedEl.getAttribute("data-distance") || groupDistance;
          slot.nestedChildren.forEach((target) => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
        }
      });
      slots.forEach((slot) => {
        if (slot.type === "nested" && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance });
        }
      });
      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: !0,
        onEnter: () => {
          const tl = gsap.timeline();
          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;
            if (slot.type === "item") {
              tl.to(slot.el, { y: 0, autoAlpha: 1, filter: "blur(0)", duration: animDuration, ease: animEase, onComplete: () => gsap.set(slot.el, { clearProps: "all" }) }, slotTime);
            } else {
              if (slot.includeParent) {
                tl.to(slot.parentEl, { y: 0, autoAlpha: 1, filter: "blur(0)", duration: animDuration, ease: animEase, onComplete: () => gsap.set(slot.parentEl, { clearProps: "all" }) }, slotTime);
              }
              const nestedMs = parseFloat(slot.nestedEl.getAttribute("data-stagger"));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              slot.nestedChildren.forEach((nestedChild, nestedIndex) => {
                tl.to(nestedChild, { y: 0, autoAlpha: 1, filter: "blur(0)", duration: animDuration, ease: animEase, onComplete: () => gsap.set(nestedChild, { clearProps: "all" }) }, slotTime + nestedIndex * nestedStaggerSec);
              });
            }
          });
        },
      });
    });
  });
  return () => ctx.revert();
}
function splitLinesAnimation() {
  const targets = document.querySelectorAll("[data-split='lines']");
  if (!targets.length) return;
  targets.forEach((el) => {
    const scrollStart = el.dataset.highlightScrollStart || "top 90%";
    const scrollEnd = el.dataset.highlightScrollEnd || "center 40%";
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: !0,
      onSplit(self) {
        const ctx = gsap.context(() => {
          const lines = self.lines;
          const count = lines.length;
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: scrollStart, end: scrollEnd, invalidateOnRefresh: !0 } });
          lines.forEach((line, i) => {
            const staggerOffset = (i * (0.135 + 0.03 * count)) / (count > 1 ? count - 1 : 1) + 0.15;
            tl.fromTo(
              line,
              { yPercent: 80, scale: 0.96, autoAlpha: 0, rotation: 1.5, filter: "blur(12px)", transformOrigin: "0% 100%" },
              {
                yPercent: 0,
                scale: 1,
                autoAlpha: 1,
                rotation: 0,
                filter: "blur(0px)",
                ease: "expo.out",
                duration: 1.05,
                onComplete() {
                  gsap.set(line, { clearProps: "filter" });
                },
              },
              staggerOffset,
            );
          });
        });
        return ctx;
      },
    });
  });
}
function initAnimationBorder() {
  const sections = document.querySelectorAll("[data-animation-border]");
  if (!sections.length) return;
  const mm = gsap.matchMedia();
  sections.forEach((section) => {
    mm.add({ isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" }, (context) => {
      const { isDesktop } = context.conditions;
      const inset = isDesktop ? "0.85rem" : "0.5rem";
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: section, start: "top top", end: "+=100%", scrub: true, invalidateOnRefresh: true, markers: false } });
      tl.fromTo(section, { clipPath: `inset(${inset} ${inset} 0rem ${inset} round 0.5rem 0.5rem 0rem 0rem)` }, { clipPath: "inset(0rem 0rem 0rem 0rem round 0rem 0rem 0rem 0rem)", duration: 1 });
    });
  });
}
function initAccordionCSS() {
  document.querySelectorAll("[data-accordion-css-init]").forEach((accordion) => {
    const closeSiblings = accordion.getAttribute("data-accordion-close-siblings") === "true";
    accordion.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-accordion-toggle]");
      if (!toggle) return;
      const singleAccordion = toggle.closest("[data-accordion-status]");
      if (!singleAccordion) return;
      const isActive = singleAccordion.getAttribute("data-accordion-status") === "active";
      singleAccordion.setAttribute("data-accordion-status", isActive ? "not-active" : "active");
      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute("data-accordion-status", "not-active");
        });
      }
    });
  });
}
function typewriterPlaceholder() {
  var el = document.querySelector(".footer-form #field");
  var text = el.getAttribute("placeholder");
  var txt = "";
  var isDeleting = false;
  var css = document.createElement("style");
  css.innerHTML = ".tw-cursor { animation: blink 0.7s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }";
  document.head.appendChild(css);
  function tick() {
    txt = isDeleting ? text.substring(0, txt.length - 1) : text.substring(0, txt.length + 1);
    el.setAttribute("placeholder", txt + "|");
    var delta = isDeleting ? 40 : 80 - Math.random() * 30;
    if (!isDeleting && txt === text) {
      delta = 2000;
      isDeleting = true;
    } else if (isDeleting && txt === "") {
      isDeleting = false;
      delta = 500;
    }
    setTimeout(tick, delta);
  }
  tick();
}
function initVideoTileScroll() {
  const section = document.querySelector(".section-video");
  if (!section) return;
  const videoTiles = section.querySelectorAll(".video-tile-wrapper");
  if (!videoTiles.length) return;

  const mm = gsap.matchMedia();
  mm.add({ isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" }, (context) => {
    const { isDesktop } = context.conditions;

    if (isDesktop) {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 15%",
          end: "+=100%",
          scrub: true,
          invalidateOnRefresh: true,
          markers: false,
          pin: true,
        },
      });
      tl.from(videoTiles, { yPercent: 100, stagger: 1, duration: 2, ease: "linear" });
    }
  });
}
function initCurveScroll() {
  const section = document.querySelector(".section-recovery");
  if (!section) return;
  const wrapper = section.querySelector(".recovery-list-wrapper");
  if (!wrapper) return;

  const items = wrapper.querySelectorAll(".recovery-heading");
  const n = items.length;

  const state = { target: 0, current: 0 };
  let anglePerItem = 14;
  let radius = 360;
  let bowStrength = 0.12;

  gsap.registerPlugin(ScrollTrigger);

  function render(activeIndex) {
    items.forEach((item, i) => {
      const theta = i - activeIndex;
      const rad = (theta * anglePerItem * Math.PI) / 180;
      const x = -radius * (1 - Math.cos(rad));
      const y = radius * Math.sin(rad) * bowStrength;
      const rotation = theta * anglePerItem;
      const dist = Math.abs(theta);
      const scale = Math.max(1 - dist * 0.06, 0.82);
      const opacity = Math.max(1 - dist * 0.22, 0.35);

      gsap.set(item, {
        x,
        y,
        rotation,
        scale,
        opacity,
        transformOrigin: "left center",
      });

      item.classList.toggle("is-active", dist < 0.5);
    });
  }

  render(0);

  const mm = gsap.matchMedia();

  mm.add({ isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" }, (context) => {
    const { isDesktop } = context.conditions;

    // tune per breakpoint
    anglePerItem = isDesktop ? 14 : 7;
    radius = isDesktop ? 360 : 140;
    bowStrength = isDesktop ? 0.12 : 0.06;

    ScrollTrigger.create({
      trigger: section,
      start: isDesktop ? "top top" : "top 20%",
      end: "+=100%",
      pin: true,
      onUpdate: (self) => {
        state.target = self.progress * (n - 1);
      },
    });

    const tick = () => {
      state.current += (state.target - state.current) * 0.08;
      render(state.current);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
    };
  });
}
function initLinkIndicator() {
  document.querySelectorAll(".plan-link-wrapper").forEach((wrapper) => {
    const links = wrapper.querySelectorAll(".plan-link");
    if (!links.length) return;

    let indicator = wrapper.querySelector(".plan-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "plan-indicator";
      wrapper.insertBefore(indicator, wrapper.firstChild);
    }

    const getActive = () => wrapper.querySelector(".plan-link.active") || links[links.length - 1];

    const moveIndicator = (btn) => {
      indicator.style.left = `${btn.offsetLeft}px`;
      indicator.style.top = `${btn.offsetTop}px`;
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.height = `${btn.offsetHeight}px`;
    };

    const setActive = (btn) => {
      links.forEach((l) => l.classList.remove("active"));
      btn.classList.add("active");
      moveIndicator(btn);
    };

    const defaultLink = links.length >= 2 ? links[1] : links[links.length - 1];
    setActive(defaultLink);

    links.forEach((link) => {
      link.addEventListener("click", () => setActive(link));
      link.addEventListener("mouseenter", () => moveIndicator(link));
      link.addEventListener("mouseleave", () => moveIndicator(getActive()));
    });

    const handleResize = debounce(() => moveIndicator(getActive()), 150);
    window.addEventListener("resize", handleResize);
  });
}
function initReadmoreDescription() {
  document.querySelectorAll("[data-description-toggle]").forEach((toggle) => {
    // Content and toggle are siblings (each in their own wrapper div)
    // Find the shared parent, then locate the content within it
    const parent = toggle.closest(".product-banner-content") || toggle.parentElement.parentElement;
    const content = parent.querySelector("[data-description-content]");
    const btnText = toggle.querySelector("span");

    if (!content) return;

    const visibleLines = parseInt(content.dataset.lines, 10) || 3;
    let initialHeight = 0;
    let fullHeight = 0;
    let expanded = false;
    let resizeTimeout = null;

    function measure() {
      const computedStyle = getComputedStyle(content);
      let lineHeight = parseFloat(computedStyle.lineHeight);

      // Fallback if line-height is "normal" (not a px value)
      if (isNaN(lineHeight)) {
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        lineHeight = fontSize * 1.2;
      }

      initialHeight = lineHeight * visibleLines;

      // Temporarily clear height to get true scrollHeight
      const prevHeight = content.style.height;
      const prevOverflow = content.style.overflow;
      content.style.height = "auto";
      content.style.overflow = "visible";
      fullHeight = content.scrollHeight;
      content.style.height = prevHeight;
      content.style.overflow = prevOverflow;
    }

    function applyHeight(instant = false) {
      const target = expanded ? fullHeight : initialHeight;
      if (instant) {
        gsap.set(content, { height: target, overflow: "hidden" });
      } else {
        gsap.to(content, {
          height: target,
          duration: 0.5,
          ease: expanded ? "power2.out" : "power2.inOut",
        });
      }
    }

    // Initial measure + collapse
    measure();
    gsap.set(content, { height: initialHeight, overflow: "hidden" });

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      expanded = !expanded;
      // Re-measure in case layout shifted since last measurement
      measure();
      applyHeight();
      btnText.textContent = expanded ? "Read Less" : "Read More";
    });

    // Debounced resize handler to keep heights accurate across breakpoints
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        measure();
        applyHeight(true); // instant, no animation on resize
      }, 200);
    });
  });
}
