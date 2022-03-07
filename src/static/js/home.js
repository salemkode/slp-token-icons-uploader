let form = document.forms[0];
let submitButton = document.querySelector("#submit");
let recaptchaInput = document.querySelector("#recaptcha");
let outputElement = document.querySelector("#output");

function recaptcha() {
  submitButton.disabled = false;
}

//
form.onsubmit = async function (event) {
  event.preventDefault();
  try {
    loadingSubmit(true);

    let respon = await fetch("api/upload", {
      method: "post",
      body: new FormData(form),
    });

    let { errors, message, url } = await respon.json();

    if (errors) {
      outputElement.innerHTML = "<h6>Solve the problems first</h6>";
      errors.forEach((error) => {
        outputElement.innerHTML += `<li>${error}</li>`;
      });
    } else {
      outputElement.innerHTML = message;

      //
      if (url) {
        outputElement.innerHTML += ` <a href="${url}">${url}</a>`;

        //
        form.reset();
      }
    }
  } catch (error) {
    // show error
    outputElement.innerHTML = error.message;
  }

  outputElement.style.display = "block";
  loadingSubmit(false);

  // Reset values
  grecaptcha.reset();
};

//
function loadingSubmit(loading) {
  // set loading of submit button
  submitButton.setAttribute("aria-busy", String(loading));
}
