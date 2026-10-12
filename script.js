const themeButton = document.createElement("button");

themeButton.textContent = "Toggle Theme";
themeButton.id = "theme-button";

document.body.prepend(themeButton);

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
});
