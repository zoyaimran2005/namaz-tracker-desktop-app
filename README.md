# Namaz Tracker Desktop App 

A cross-platform desktop application built with Electron to help users track and organize their daily prayers (Salah/Namaz).

---

## Download & Install

If you just want to use the application without touching any code, download the pre-built installer for your operating system from the [Releases Page](https://github.com/zoyaimran2005/namaz-tracker-desktop-app/releases):

| Operating System | File to Download | How to Run |
| :--- | :--- | :--- |
| **Windows** | `Namaz Tracker Setup x.x.x.exe` | Download the `.exe` installer, double-click, and follow the setup wizard. |
| **macOS** | `Namaz Tracker-x.x.x.dmg` | Open the `.dmg` file and drag **Namaz Tracker** into your **Applications** folder. |
| **Linux** | `Namaz-Tracker-x.x.x.AppImage` | Make the file executable (`chmod +x Namaz-Tracker-x.x.x.AppImage`) and double-click to launch. |

> **Note for First-Time Launch:**  
> Because the app is self-signed, your operating system may show a security notice on first launch:
> * **Windows:** Click **More info** $\rightarrow$ **Run anyway**.
> * **macOS:** Right-click (or `Control` + Click) the app in Applications $\rightarrow$ Click **Open**.

---

## Running via Cloning the Repository

If you prefer to clone the repository, run the application from source, or build the executable locally on your machine, follow these steps:

### Prerequisites

Make sure you have the following installed on your computer:
* **[Node.js](https://nodejs.org/)** (v20 or higher recommended)
* **Git**

---

### Step 1: Clone the Repository

Open your terminal or command prompt and clone the project:
---
git clone [https://github.com/zoyaimran2005/namaz-tracker-desktop-app.git](https://github.com/zoyaimran2005/namaz-tracker-desktop-app.git)

cd namaz-tracker-desktop-app

---
Step 2: Install Dependencies
---
Install all required npm dependencies (including Electron and development utilities):

---

npm install

---
Step 3: Run the App Locally
---
To start the application in development mode directly from source:


npm start

---
