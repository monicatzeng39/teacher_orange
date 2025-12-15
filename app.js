document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const send = document.getElementById("send");

  send.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) {
      output.textContent = "請先輸入內容";
      return;
    }
    output.textContent = "你輸入了：\n" + text;
  });

  const ok = document.createElement("div");
  ok.textContent = "app.js OK ✅";
  ok.style.position = "fixed";
  ok.style.bottom = "10px";
  ok.style.right = "10px";
  ok.style.color = "green";
  document.body.appendChild(ok);
});
