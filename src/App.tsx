import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import routers from '@/router';
import { useDidMount } from '@/hooks';
import { useNavigate } from 'react-router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/utils/firebase';

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
        navigate('/');
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
