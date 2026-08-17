export const VERSION = "0.1.0";

export function describeModelPermit() {
  return "modelpermit validates local model-use policy drafts before release.";
}

const approvalModes = new Set(["manual", "ask", "auto"]);
const networkPolicies = new Set(["none", "allowlist", "any"]);

export function checkPermit(policy) {
  const errors = [];
  const warnings = [];

  if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
    return { valid: false, errors: ["policy must be a JSON object"], warnings };
  }

  if (!Array.isArray(policy.allowedModels) || policy.allowedModels.length === 0) {
    errors.push("allowedModels must be a non-empty array of model ids");
  } else if (policy.allowedModels.some((model) => typeof model !== "string" || model.trim() === "")) {
    errors.push("allowedModels entries must be non-empty strings");
  }

  if (policy.deniedModels !== undefined && !Array.isArray(policy.deniedModels)) {
    errors.push("deniedModels must be an array when present");
  } else if (Array.isArray(policy.deniedModels) && policy.deniedModels.some((model) => typeof model !== "string" || model.trim() === "")) {
    errors.push("deniedModels entries must be non-empty strings");
  }

  if (Array.isArray(policy.allowedModels) && Array.isArray(policy.deniedModels)) {
    const deniedModels = new Set(policy.deniedModels);
    const conflicts = [...new Set(policy.allowedModels.filter((model) => deniedModels.has(model)))].sort();

    if (conflicts.length > 0) {
      errors.push(`allowedModels and deniedModels overlap: ${conflicts.join(", ")}`);
    }
  }

  if (policy.approvalMode !== undefined && !approvalModes.has(policy.approvalMode)) {
    errors.push(`approvalMode must be one of ${[...approvalModes].join(", ")}`);
  }

  if (policy.network !== undefined && !networkPolicies.has(policy.network)) {
    errors.push(`network must be one of ${[...networkPolicies].join(", ")}`);
  }

  if (policy.network === "any") {
    warnings.push("network:any should be reviewed before release");
  }

  if (policy.writePaths !== undefined && !Array.isArray(policy.writePaths)) {
    errors.push("writePaths must be an array when present");
  }

  if (Array.isArray(policy.writePaths) && policy.writePaths.some((path) => typeof path !== "string" || path.trim() === "")) {
    errors.push("writePaths entries must be non-empty strings");
  }

  if (Array.isArray(policy.writePaths) && policy.writePaths.includes("/")) {
    warnings.push("writePaths includes repository-external root access");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function formatPermitReport(result) {
  const lines = [
    "# modelpermit report",
    "",
    `Status: ${result.valid ? "valid" : "invalid"}`
  ];

  if (result.errors.length > 0) {
    lines.push("", "## Errors", ...result.errors.map((error) => `- ${error}`));
  }

  if (result.warnings.length > 0) {
    lines.push("", "## Warnings", ...result.warnings.map((warning) => `- ${warning}`));
  }

  return `${lines.join("\n")}\n`;
}
