# Traditional Chinese Study Tool

This is a pure JavaScript and HTML project for studying Traditional Chinese.

## Goal

The main goal of this project is to provide a user interface for studying Chinese texts. The interface will be split into two panels:
- A top panel displaying the text under study.
- A bottom panel for interactions with the text, such as definitions, notes, and exercises.

## Features

- **Client-Side Only:** The application will run entirely in the browser, with no server-side component.
- **Responsive Design:** It is intended to work on all devices, from desktops to mobile phones.
- **Local Storage:** User data, such as progress and notes, will be persisted in the browser's local storage.
- **LLM Integration:** In the future, [LangChain](https://www.langchain.com/) may be used to interact with Large Language Models (LLMs) for enhanced learning experiences.

## Development

- **Formatting:** [Prettier](https://prettier.io/) is used for code formatting to maintain a consistent style.
- **Testing:** A simple testing harness will be set up for testing the pure JavaScript code.

## Deployment

This project is designed to be deployed using GitHub Pages.

### Steps to Deploy

1.  **Push to GitHub:** Make sure your code is pushed to a GitHub repository.
2.  **Enable GitHub Pages:**
    *   Go to your repository's **Settings** tab.
    *   In the "Code and automation" section of the sidebar, click on **Pages**.
    *   Under "Build and deployment", for the **Source**, select **Deploy from a branch**.
    *   Under "Branch", select your main branch (e.g., `main` or `master`) and choose the `/docs` folder.
    *   Click **Save**.
3.  **Access Your Site:** Your site will be available at `https://[username].github.io/[repository]/`. You will need to replace `[username]` with your GitHub username and `[repository]` with your repository name.