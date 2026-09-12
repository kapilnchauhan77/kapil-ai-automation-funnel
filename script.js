(function () {
  "use strict";
  var doc = document;
  var body = doc.body;
  body.classList.add("has-js");

  function motionReduced() { return body && body.dataset.motion === "reduced"; }
  var motionToggle = doc.querySelector("#motionToggle");
  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var motionOverride = false;
  function applyMotion(reduced) {
    if (!body) return;
    body.dataset.motion = reduced ? "reduced" : "full";
    if (motionToggle) motionToggle.setAttribute("aria-pressed", String(reduced));
  }
  applyMotion(Boolean(motionQuery && motionQuery.matches));
  var navToggle = doc.querySelector("#navToggle");
  var primaryNav = doc.querySelector("#primaryNav");
  var navLinks = primaryNav ? primaryNav.querySelectorAll("a") : [];
  var lastNavFocus = null;
  function closeNav(restoreFocus) {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove("open"); body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false"); navToggle.setAttribute("aria-label", "Open navigation");
    if (restoreFocus && lastNavFocus && lastNavFocus.focus) lastNavFocus.focus();
    lastNavFocus = null;
  }
  function openNav() {
    if (!primaryNav || !navToggle) return;
    lastNavFocus = doc.activeElement; primaryNav.classList.add("open"); body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true"); navToggle.setAttribute("aria-label", "Close navigation");
    if (navLinks[0] && navLinks[0].focus) navLinks[0].focus();
  }
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () { if (primaryNav.classList.contains("open")) closeNav(true); else openNav(); });
    primaryNav.addEventListener("click", function (event) { if (event.target.closest && event.target.closest("a")) closeNav(false); });
    doc.addEventListener("click", function (event) { if (primaryNav.classList.contains("open") && !primaryNav.contains(event.target) && !navToggle.contains(event.target)) closeNav(false); });
    doc.addEventListener("keydown", function (event) { if (event.key === "Escape" && primaryNav.classList.contains("open")) closeNav(true); });
  }

  var revealNodes = doc.querySelectorAll("[data-reveal]");
  if (revealNodes.length) {
    if ("IntersectionObserver" in window) {
      if (!motionReduced()) revealNodes.forEach(function (node) { node.classList.add("is-pending"); });
      if (motionReduced()) revealNodes.forEach(function (node) { node.classList.add("is-visible"); });
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
      }, { threshold: 0.12 });
      revealNodes.forEach(function (node) { revealObserver.observe(node); });
    } else {
      revealNodes.forEach(function (node) { node.classList.add("is-visible"); node.style.opacity = "1"; node.style.transform = "none"; });
    }
  }

  var brief = doc.querySelector("#projectBrief");
  var trackInputs = brief ? brief.querySelectorAll("input[name='projectType']") : [];
  var goalSelect = brief ? brief.querySelector("select[name='goal']") : null;
  var contextInput = brief ? brief.querySelector("textarea[name='context']") : null;
  var budgetSelect = brief ? brief.querySelector("select[name='budget']") : null;
  var timelineSelect = brief ? brief.querySelector("select[name='timeline']") : null;
  var briefPreview = doc.querySelector("#briefPreview");
  var briefTitle = doc.querySelector("#briefTitle");
  var briefSummary = doc.querySelector("#briefSummary");
  var briefRoute = doc.querySelector("#briefRoute");
  var briefStatus = doc.querySelector("#briefStatus");
  var downloadBrief = doc.querySelector("#downloadBrief");
  var emailBrief = doc.querySelector("#emailBrief");
  var goalOptions = { website: ["Launch a business website", "Improve an existing website", "Build a web product"], automation: ["Automate document processing", "Connect business tools", "Build an AI assistant"] };
  var goalSummaries = {
    "Launch a business website": "A clear, responsive site that gives your offer a useful home and a direct next step.",
    "Improve an existing website": "A focused review and rebuild of the parts of your site that should work harder.",
    "Build a web product": "A practical web product shaped around the first useful workflow and a path to release.",
    "Automate document processing": "A workflow that moves documents through extraction, review, and the right business system.",
    "Connect business tools": "A connected workflow that removes repeated handoffs between the tools your team already uses.",
    "Build an AI assistant": "An assistant focused on a real team task, its source material, and a safe handoff."
  };
  var routeLabels = { website: ["Shape", "Design", "Build", "Launch"], automation: ["Map", "Connect", "Test", "Roll out"] };
  function selectedTrack() {
    var checked = Array.prototype.find.call(trackInputs, function (input) { return input.checked; });
    return checked && checked.value === "automation" ? "automation" : "website";
  }
  function selectedValue(select, fallback) { return select && select.value ? select.value : fallback; }
  function updateChoiceStates(track) {
    trackInputs.forEach(function (input) {
      if (input.parentElement) input.parentElement.classList.toggle("is-active", input.value === track);
    });
    doc.querySelectorAll("[data-project-choice]").forEach(function (choice) {
      var active = choice.getAttribute("data-project-choice") === track; choice.classList.toggle("is-active", active);
      if (choice.matches("button, [role='button']")) choice.setAttribute("aria-pressed", String(active));
    });
  }
  function setTrack(track) {
    var safeTrack = track === "automation" ? "automation" : "website";
    trackInputs.forEach(function (input) { input.checked = input.value === safeTrack; });
    if (goalSelect) {
      var current = goalSelect.value; while (goalSelect.firstChild) goalSelect.removeChild(goalSelect.firstChild);
      goalOptions[safeTrack].forEach(function (label) { var option = doc.createElement("option"); option.value = label; option.textContent = label; goalSelect.appendChild(option); });
      goalSelect.value = goalOptions[safeTrack].indexOf(current) >= 0 ? current : goalOptions[safeTrack][0];
    }
    updateChoiceStates(safeTrack); updateBrief();
  }
  function briefText() {
    var track = selectedTrack(); var trackLabel = track === "automation" ? "AI automation" : "Website development";
    var goal = selectedValue(goalSelect, goalOptions[track][0]); var context = contextInput ? contextInput.value.trim() : "";
    var budget = selectedValue(budgetSelect, "Let’s scope it first"); var timeline = selectedValue(timelineSelect, "Flexible");
    return ["Project brief", "============", "Track: " + trackLabel, "Goal: " + goal, "Budget: " + budget, "Timeline: " + timeline, "", "Context:", context || "No context added yet.", "", "Suggested next step:", "Share this brief with Kapil so the first conversation can focus on scope, constraints, and a useful starting point."].join("\n");
  }
  function updateBrief() {
    if (!brief) return;
    var track = selectedTrack(); var goal = selectedValue(goalSelect, goalOptions[track][0]);
    if (briefTitle) briefTitle.textContent = track === "automation" ? "Shape an automation project" : "Shape a website project";
    if (briefSummary) briefSummary.textContent = goalSummaries[goal] || "A focused project shaped around your next useful outcome.";
    if (briefPreview) briefPreview.textContent = briefText();
    if (briefRoute) briefRoute.querySelectorAll(".route-node").forEach(function (node, index) { node.textContent = routeLabels[track][index] || routeLabels[track][routeLabels[track].length - 1]; });
    if (emailBrief) emailBrief.href = "mailto:kapilnchauhan77@gmail.com?subject=" + encodeURIComponent("Project brief: " + goal) + "&body=" + encodeURIComponent(briefText());
  }
  if (brief) {
    if (downloadBrief) downloadBrief.disabled = false;
    trackInputs.forEach(function (input) { input.addEventListener("change", function () { setTrack(input.value); }); });
    [goalSelect, contextInput, budgetSelect, timelineSelect].forEach(function (field) { if (field) field.addEventListener(field.tagName === "TEXTAREA" ? "input" : "change", updateBrief); });
    brief.addEventListener("submit", function (event) { event.preventDefault(); updateBrief(); if (briefStatus) briefStatus.textContent = "Your brief is ready to download or carry into an email."; });
    setTrack(selectedTrack());
  }
  doc.querySelectorAll("[data-project-choice]").forEach(function (choice) {
    choice.addEventListener("click", function () {
      var track = choice.getAttribute("data-project-choice"); if (!brief || (track !== "website" && track !== "automation")) return;
      setTrack(track); var start = doc.querySelector("#start"); if (start) start.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
    });
  });
  if (downloadBrief) {
    downloadBrief.type = "button";
    downloadBrief.addEventListener("click", function () {
      var file = new Blob([briefText()], { type: "text/plain;charset=utf-8" }); var url = URL.createObjectURL(file); var link = doc.createElement("a");
      link.href = url; link.download = "kapil-project-brief.txt"; doc.body.appendChild(link); link.click(); link.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      if (briefStatus) briefStatus.textContent = "Download started: kapil-project-brief.txt.";
    });
  }

  if (motionToggle) { motionToggle.type = "button"; motionToggle.addEventListener("click", function () { motionOverride = true; applyMotion(!motionReduced()); }); }
  if (motionQuery) { var motionChange = function (event) { if (!motionOverride) applyMotion(event.matches); }; if (motionQuery.addEventListener) motionQuery.addEventListener("change", motionChange); else if (motionQuery.addListener) motionQuery.addListener(motionChange); }

  var heroScene = doc.querySelector(".hero-scene"); var heroFrame = 0; var heroProgress = 0; var pointerX = 0; var pointerY = 0;
  function renderHero() { heroFrame = 0; if (!heroScene || motionReduced()) return; heroScene.style.setProperty("--hero-progress", heroProgress.toFixed(3)); heroScene.style.setProperty("--pointer-x", pointerX.toFixed(2) + "px"); heroScene.style.setProperty("--pointer-y", pointerY.toFixed(2) + "px"); }
  function scheduleHero() { if (!heroFrame) heroFrame = window.requestAnimationFrame ? window.requestAnimationFrame(renderHero) : window.setTimeout(renderHero, 16); }
  if (heroScene) {
    window.addEventListener("scroll", function () { var rect = heroScene.getBoundingClientRect(); var range = Math.max(window.innerHeight + rect.height, 1); heroProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / range)); scheduleHero(); }, { passive: true });
    if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      heroScene.addEventListener("pointermove", function (event) { var rect = heroScene.getBoundingClientRect(); pointerX = Math.max(-5, Math.min(5, ((event.clientX - rect.left) / rect.width - 0.5) * 10)); pointerY = Math.max(-5, Math.min(5, ((event.clientY - rect.top) / rect.height - 0.5) * 10)); scheduleHero(); }, { passive: true });
      heroScene.addEventListener("pointerleave", function () { pointerX = 0; pointerY = 0; scheduleHero(); });
    }
  }
  if (window.ScrollCraft && typeof window.ScrollCraft.mount === "function") {
    try { window.ScrollCraft.mount(body); }
    catch (error) { body.dataset.scrollcraft = "error"; }
  }
}());
