const theme = localStorage.getItem('theme');
if (theme === null) {
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) {
    document.querySelector('html').classList.add("dark");
  }
  localStorage.setItem("theme", dark ? "dark" : "light");
}
else {
  if (theme === "dark") {
    document.querySelector('html').classList.add("dark");
  }
  localStorage.setItem("theme", theme === "dark" ? "dark" : "light");
}
