const navToggle = document.querySelector("#navToggle");
const primaryNav = document.querySelector("#primaryNav");
const hoursRange = document.querySelector("#hoursRange");
const costRange = document.querySelector("#costRange");
const automationRange = document.querySelector("#automationRange");
const hoursOutput = document.querySelector("#hoursOutput");
const costOutput = document.querySelector("#costOutput");
const automationOutput = document.querySelector("#automationOutput");
const annualSavings = document.querySelector("#annualSavings");
const auditForm = document.querySelector("#auditForm");
const formStatus = document.querySelector("#formStatus");
const submitButton = auditForm.querySelector("button[type='submit']");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function updateEstimator() {
  const weeklyHours = Number(hoursRange.value);
  const hourlyCost = Number(costRange.value);
  const automationPotential = Number(automationRange.value) / 100;
  const annualOpportunity = weeklyHours * hourlyCost * 52 * automationPotential;

  hoursOutput.value = weeklyHours;
  costOutput.value = currencyFormatter.format(hourlyCost);
  automationOutput.value = `${Math.round(automationPotential * 100)}%`;
  annualSavings.textContent = currencyFormatter.format(annualOpportunity);
}

function closeNav() {
  primaryNav.classList.remove("open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

function toggleNav() {
  const isOpen = primaryNav.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

function getAuditEndpoint() {
  const configuredBase = window.AUDIT_API_BASE || document.querySelector("meta[name='audit-api-base']")?.content?.trim();

  if (configuredBase) {
    return `${configuredBase.replace(/\/$/, "")}/api/audit-request`;
  }

  if (window.location.protocol === "file:") {
    return "http://127.0.0.1:3000/api/audit-request";
  }

  if (window.location.hostname.endsWith("github.io")) {
    return "";
  }

  return "/api/audit-request";
}

function openEmailFallback(formData) {
  const subject = encodeURIComponent("AI Automation Audit request");
  const body = encodeURIComponent(
    [
      "Hi Kapil,",
      "",
      "I'd like to request an AI Automation Audit.",
      "",
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Company: ${formData.get("company") || ""}`,
      "",
      "Workflow:",
      formData.get("workflow") || "",
    ].join("\n")
  );

  window.location.href = `mailto:kapilnchauhan77@gmail.com?subject=${subject}&body=${body}`;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(auditForm);
  const name = formData.get("name")?.toString().trim() || "there";
  const endpoint = getAuditEndpoint();

  if (!endpoint) {
    openEmailFallback(formData);
    formStatus.textContent = `Thanks, ${name}. Your email app should open with the audit request ready.`;
    return;
  }

  submitButton.disabled = true;
  formStatus.textContent = "Sending your audit request...";

  try {
    const response = await fetch(getAuditEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "The request could not be sent.");
    }

    formStatus.textContent = result.message || `Thanks, ${name}. Your audit request has been sent.`;
    auditForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || "The form could not send right now. Please email Kapil directly.";
  } finally {
    submitButton.disabled = false;
  }
}

[hoursRange, costRange, automationRange].forEach((control) => {
  control.addEventListener("input", updateEstimator);
});

navToggle.addEventListener("click", toggleNav);
primaryNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    closeNav();
  }
});

auditForm.addEventListener("submit", handleFormSubmit);

updateEstimator();
