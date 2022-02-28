let form = document.forms[0];
let data = document.querySelector("#data");
let submit = document.querySelector("#submit");

form.onsubmit = async function (event) {
  event.preventDefault();

  submit.setAttribute("aria-busy", true);
  let respon = await fetch("api/upload", {
    method: "post",
    body: new FormData(form),
  });

  let json = await respon.json();

  if (Array.isArray(json.error)) {
    let errors = json.error
      .map((error) => {
        return `<li>${error}</li>`;
      })
      .join("");

    data.innerHTML = errors;
  } else {
    data.innerHTML = json.message;
    json.url && (data.innerHTML += ` <a href="${json.url}">${json.url}</a>`);
  }
  data.style.display = "block";
  submit.setAttribute("aria-busy", false);
  console.log(json);
};
