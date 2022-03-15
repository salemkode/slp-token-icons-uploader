let form = document.forms[0];
let submitButton = document.querySelector("#submit");
let recaptchaInput = document.querySelector("#recaptcha");
let outputElement = document.querySelector("#output");
let paddingSection = document.querySelector("#paddingSection");
let waitingMessage = document.querySelector("#waitingMessage");
let completeSection = document.querySelector("#completeSection");

//
function recaptcha() {
  submitButton.disabled = false;
}

//
form.onsubmit = async function (event) {
  event.preventDefault();
  removeValidation();
  try {
    loadingSubmit(true);

    let respon = await fetch("api/upload", {
      method: "post",
      body: new FormData(form),
    });

    let respon_json = await respon.json();

    //
    let { processId, error } = respon_json;

    //
    if (typeof error === "object") {
      outputElement.innerHTML = "<h6>Solve the problems first</h6>";

      //
      for (let errorPath in error) {
        let errorMsg = error[errorPath];

        //
        document
          .querySelector("#" + errorPath)
          .setAttribute("aria-invalid", true);

        //
        outputElement.innerHTML += `<li>${errorMsg}</li>`;
      }
    } else if (error) {
      outputElement.innerHTML += `<li>${error}</li>`;
    }

    //
    if (processId) {
      initSocket(processId);
      //
      toggleSection("padding");
    }
  } catch (error) {
    // show error
    outputElement.innerHTML = error.message;
  }

  //
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

//
function toggleSection(name) {
  let sections = {
    form,
    padding: paddingSection,
    complete: completeSection,
  };

  //
  for (let key in sections) {
    sections[key].classList.add("none");
  }

  //
  sections[name].classList.remove("none");
}

//
function removeValidation() {
  outputElement.innerHTML = "";
  document
    .querySelectorAll(`[aria-invalid=true]`)
    .forEach((element) => element.setAttribute("aria-invalid", ""));
}

function initSocket(processId) {
  //
  const socket = io("", {
    query: {
      processId,
    },
  });

  //
  socket.on("connect", () => {
    //
    socket.on("update process", (process) => {
      waitingMessage.textContent = process;
    });

    //
    socket.on("complete process", (process, processURL) => {
      // Create link element
      let linkElement = document.createElement("a");
      linkElement.href = processURL;
      linkElement.textContent = processURL;

      //
      completeSection.appendChild(linkElement);
      toggleSection("complete");
    });
  });
}
