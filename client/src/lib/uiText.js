//? Shared labels so status chips read like normal title case in the UI (makes life easy for me! :))
export function taskStatusLabel(status) {
  return String(status)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}