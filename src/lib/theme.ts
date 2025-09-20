// Theme initialization and persistence
export function initializeTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem("theme");
  
  // Check system preference if no stored theme
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  // Determine initial theme
  const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
  
  // Apply theme
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  // Store the theme
  localStorage.setItem("theme", initialTheme);
}