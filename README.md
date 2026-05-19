# Ziko Home - Client Documentation

## 🚀 Quick Start
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file in the root of this directory:
   ```env
   VITE_API_URL="http://localhost:5000/api/v1"
   VITE_GOOGLE_MAPS_KEY="your_google_maps_api_key_here"
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Build & Production
To create a production-optimized build:
```bash
npm run build
```
The output will be in the `dist/` folder.

---

## 🌐 Alternative Hosting Guides
Since this is a Single Page Application (SPA), the hosting platform **must** support fallback routing (redirecting all non-file requests to `index.html`).

### 1. Cloudflare Pages (Recommended)
1. **Connect**: Connect your GitHub repository.
2. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**: Add `VITE_API_URL` and `VITE_GOOGLE_MAPS_KEY` in the Cloudflare dashboard.
4. **Routing**: Cloudflare Pages handles SPA routing automatically.

### 2. DigitalOcean App Platform (Static Site)
1. **Create App**: Select your repo.
2. **Resource Type**: Choose **Static Site**.
3. **Build Command**: `npm run build`.
4. **Output Directory**: `dist`.
5. **Routes**: Ensure the index document is set to `index.html`.

### 3. AWS S3 + CloudFront
1. **S3**: Create a bucket, enable "Static website hosting".
2. **Upload**: Push the contents of `dist/` to the bucket.
3. **CloudFront**: Create a distribution pointing to the S3 bucket.
4. **SPA Fix**: Under **Error Pages**, create a custom error response:
   - **HTTP Error Code**: 404
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: 200

---

## 🛠️ Key Technologies
- **React 19**: UI Logic.
- **Redux Toolkit**: Global state (Auth, UI).
- **React Router 7**: Navigation.
- **TailwindCSS**: Styling.
- **i18next**: Multi-language support.
