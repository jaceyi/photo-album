import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import routers from '@/router';
import { useDidMount } from '@/hooks';
import { useNavigate } from 'react-router';
import {
  getRedirectResult,
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import styles from './app.module.scss';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user]);

  useDidMount(() => {
    onAuthStateChanged(auth, async (user: User) => {
      if (user) {
        setUser(user);
      } else {
        try {
          const result = await getRedirectResult(auth);
          if (!result) throw Error('not result');
          setUser(result.user);
        } catch (error: any) {
          const provider = new GoogleAuthProvider();
          signInWithRedirect(auth, provider);
        }
      }
    });
  });

  return (
    <div className={styles.app}>
      <Routes>
        {routers.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
};
export default App;
