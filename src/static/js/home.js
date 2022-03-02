let form = document.forms[0];
let submitButton = document.querySelector("#submit");
let recaptchaInput = document.querySelector("#recaptcha");
let messageElement = document.querySelector("#message");

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
      messageElement.innerHTML = "<h6>Solve the problems first</h6>";
      errors.forEach((error) => {
        messageElement.innerHTML += `<li>${error}</li>`;
      });
    } else {
      messageElement.innerHTML = message;

      //
      if (url) messageElement.innerHTML += ` <a href="${url}">${url}</a>`;
    }
  } catch (error) {
    // show error
    messageElement.innerHTML += error.message;
  }

  messageElement.style.display = "block";
  loadingSubmit(false);

  // Reset values
  form.reset();
  grecaptcha.reset();
};

//
function loadingSubmit(loading) {
  // set loading of submit button
  submitButton.setAttribute("aria-busy", String(loading));
}
