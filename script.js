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
const formSuccess = document.querySelector("#formSuccess");
const submitButton = auditForm?.querySelector("button[type='submit']") ?? null;
const formFields = auditForm?.querySelectorAll("label, input, textarea, button[type='submit']") ?? [];

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

function getWeb3FormsKey() {
  const key = document.querySelector("meta[name='web3forms-access-key']")?.content?.trim();
  if (!key || key === "YOUR_WEB3FORMS_ACCESS_KEY") return "";
  return key;
}

function getAuditEndpoint() {
  if (getWeb3FormsKey()) {
    return "https://api.web3forms.com/submit";
  }

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

function buildAuditPayload(formData) {
  const key = getWeb3FormsKey();
  const base = Object.fromEntries(formData.entries());

  if (key) {
    const name = (base.name || "there").toString().trim();
    return {
      access_key: key,
      subject: `New AI Automation Audit request from ${name}`,
      from_name: "Kapil Chauhan funnel",
      replyto: base.email || "",
      name: base.name || "",
      email: base.email || "",
      company: base.company || "",
      workflow: base.workflow || "",
      message: [
        `Name: ${base.name || ""}`,
        `Email: ${base.email || ""}`,
        `Company: ${base.company || "—"}`,
        "",
        "Workflow:",
        base.workflow || "",
      ].join("\n"),
      botcheck: "",
    };
  }

  return base;
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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildAuditPayload(formData)),
    });

    const result = await response.json().catch(() => ({}));
    const sent = response.ok && (result.success === true || result.ok === true);

    if (!sent) {
      throw new Error(result.message || "The request could not be sent.");
    }

    formStatus.textContent = "";
    auditForm.reset();
    formFields.forEach((el) => { el.hidden = true; });
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (error) {
    formStatus.textContent = error.message || "The form could not send right now. Please email Kapil directly.";
  } finally {
    submitButton.disabled = false;
  }
}

if (hoursRange && costRange && automationRange) {
  [hoursRange, costRange, automationRange].forEach((control) => {
    control.addEventListener("input", updateEstimator);
  });
  updateEstimator();
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", toggleNav);
  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });
}

if (auditForm) {
  auditForm.addEventListener("submit", handleFormSubmit);
}
