import 'react-alert-confirm/lib/style.css';
import 'react-photo-view/dist/react-photo-view.css';
import './base.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import config from './config.json';
import './utils/firebase';
import AlertConfirm from 'react-alert-confirm';

AlertConfirm.config({
  zIndex: 999999999,
  lang: 'zh'
});

console.log(`version: ${config.version}`);

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
