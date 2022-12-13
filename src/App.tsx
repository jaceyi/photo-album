import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import routers from '@/router';
import { useDidMount } from '@/hooks';
import { useNavigate } from 'react-router';
import {
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import AlertConfirm from 'react-alert-confirm';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user]);

  useDidMount(() => {
    onAuthStateChanged(auth, async user => {
      if (user) {
        (window as any).signOut = () => signOut(auth);
        setUser(user);
      } else {
        let phoneNumber: string = '';
        await AlertConfirm({
          title: '登陆',
          desc: (
            <div>
              <input
                onChange={e => (phoneNumber = e.target.value)}
                type="text"
                placeholder="请输入电话号码"
              />
            </div>
          )
        });
        AlertConfirm({
          title: '验证',
          desc: <div id="recaptcha-container" />
        });
        const recaptchaVerifier = new RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'normal',
            callback: () => {
              signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
                .then(confirmationResult => {
                  console.log('confirmationResult', confirmationResult);
                })
                .catch(error => {
                  console.log('error', error);
                });
            }
          },
          auth
        );
      }
    });
  });

  return (
    <div>
      <Routes>
        {routers.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
};
export default App;
