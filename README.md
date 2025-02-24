
# 🏠 Home Inventory & Insurance Claim Assistant

An AI-powered web application that helps users keep track of household items by analyzing images, estimating their value, and generating detailed reports for insurance claims. Built with **Next.js and Gemini API**, this app makes it easy to document possessions and streamline insurance claims.

---

## 🚀 Features

✅ **AI-Powered Image Recognition** - Upload a picture of a room, and the app detects and lists all items with estimated prices.  
✅ **Instant Total Valuation** - Get a breakdown of the total worth of your household inventory.   
✅ **One-Click Insurance Report** - Generate a downloadable PDF/CSV to share with insurance providers.  
✅ **Mobile-Friendly UI** - A clean, intuitive interface optimized for mobile and desktop users.  

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/), React, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **AI Integration:** [Google Gemini API](https://ai.google.dev/)  
- **UI Components:** Material-UI / Tailwind  
- **Deployment:** Vercel  

---

## 📦 Installation

### 🔧 Prerequisites
Ensure you have the following installed:
- **Node.js** (>= 16)
- **npm** or **yarn**
- **Google Gemini API key**


### 📦 Install Dependencies
Using npm:
```sh
npm install
```
Or using yarn:
```sh
yarn install
```


### 🚀 Run the App (Development Mode)
Using npm:
```sh
npm run dev
```
Or using yarn:
```sh
yarn dev
```
The app will run at [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

### 📤 Upload an Image for AI Analysis
```http
POST /api/upload
```
**Request:**
- `multipart/form-data` with an image file

**Response:**
```json
{
  "status": "success",
  "items": [
    {
      "name": "Sofa",
      "price_estimate": 599.99
    },
    {
      "name": "TV",
      "price_estimate": 899.99
    }
  ],
  "total_value": 1499.98
}
```

## 🤝 Contributing
🚀 I welcome contributions! Follow these steps:
1. Fork the repository  
2. Create a new branch (`feature-xyz`)  
3. Commit your changes (`git commit -m "Added feature xyz"`)  
4. Push to your branch (`git push origin feature-xyz`)  
5. Open a Pull Request 🎉  


