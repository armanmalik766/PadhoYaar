<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/13wwCUJ3Aa8ZXD7VehnqF_8ehj2JTgFkU

## Run Locally

**Prerequisites:**  Node.js


1. **Install MongoDB:** Ensure MongoDB is installed and running locally on default port 27017.
2. **Install dependencies:**
   `npm install`
3. **Set Environment Variables:**
   - Set `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
   - (Optional) Set `MONGODB_URI` in `.env` if not using localhost.
4. **Start the Backend Server:**
   `npx tsx server.ts`
   (Runs on port 3000)
5. **Start the Frontend Application:**
   `npm run dev`
   (Runs on port 5173)
