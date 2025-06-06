import React from 'react';
import ReactDOM from 'react-dom/client';
import Application from "./app.tsx";
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>
);