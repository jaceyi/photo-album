import 'react-alert-confirm/dist/index.css';
import 'react-photo-view/dist/react-photo-view.css';
import './base.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import config from './config.json';
import './utils/firebase';
import alertConfirm from 'react-alert-confirm';

alertConfirm.config({
  zIndex: 999999999
});

console.log(`version: ${config.version}`);

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
