# **App Name**: VisiVest

## Core Features:

- Homepage Video Grid: Displays a responsive grid of videos on the homepage, each with a thumbnail, title, and category.
- Video Player Page: A dedicated page for each video featuring an embedded player (Google Drive / direct MP4) and associated video details.
- Category Browsing: Allows users to filter videos by categories via a simple navigation option.
- Admin: Video Management: Admins can add new videos by providing a title, link (Google Drive / direct MP4), thumbnail URL, and category, or delete existing videos.
- User Authentication: Secures admin features by requiring login using Firebase Authentication.
- Firestore Data Storage: Utilizes Firestore to persistently store video metadata (title, link, thumbnail, category) and manage admin user data.
- AI Video Synopsis Generator: A generative AI tool that provides a concise summary or synopsis for new videos based on their title and category during the admin video submission process.

## Style Guidelines:

- Color Palette: A light, muted, and professional scheme. Primary elements like headers and call-to-actions use a calm, mid-tone blue (#7AA1CC). The background is a very light, almost white, blue-gray (#EBEEF1), providing a clean canvas. An accent color, a fresh cyan (#3AB2CC), is used sparingly for highlights and interactive elements, ensuring visual interest and contrast.
- Font Recommendation: 'Inter' (sans-serif) is chosen for both headlines and body text. Its neutral, modern, and highly legible characteristics support the app's clean and minimal UI aesthetic across all content types.
- Icon Style: Minimalist line icons are preferred to maintain a clean and uncluttered interface. Icons should be clear, easily recognizable, and contribute to the overall modern and airy feel.
- Layout and Structure: A fluid and responsive grid system ensures optimal viewing on all device sizes, from mobile to desktop. Content is presented within 'soft shadows and rounded cards,' giving elements a subtle depth and a friendly, contemporary appearance, consistent with the Tailwind CSS visual language.
- Subtle Interactions: Gentle and unobtrusive animations or transitions for navigation links, button hovers, and page loads enhance user experience without detracting from the minimal aesthetic.