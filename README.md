<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 橘子老師 - GitHub Pages 版（安全：前端不含 API Key）

這個版本可以直接部署到 **GitHub Pages** 使用。

## 部署到 GitHub Pages（最簡單）

1. 把整個專案推到 GitHub（root 目錄要有 `index.html`）
2. 到 GitHub Repo → **Settings** → **Pages**
3. Source 選：**Deploy from a branch**
4. Branch 選：`main`（或 `master`）/ Folder 選：`/(root)`
5. 儲存後，等 GitHub 給你網址就能開啟

## 使用方式

* 預設是「示範模式」：不會呼叫任何外部 API。
* 若你有自己的後端（Cloudflare Workers / Netlify Functions / 自架 API）：
  1. 網頁右上角點 **設定**
  2. 貼上你的「後端 API Endpoint」
  3. 儲存後即可啟用真正的 AI 回覆

⚠️ 重要：GitHub Pages 是純前端靜態站，請不要把任何 API Key 放在前端或 repo。

## 本地端開啟（免 Node / 免安裝）

這個專案是純靜態檔案，你可以直接用瀏覽器開 `index.html` 測試（或使用任意靜態伺服器）。
