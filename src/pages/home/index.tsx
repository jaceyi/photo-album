import * as React from 'react';
import { useDidMount } from '@/hooks';
import * as styles from './style.module.scss';
import SettingIcon from './components/SettingIcon';
import { TagGroup } from '@/components';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useConfig } from '@/hooks';

export interface Photo {
  id: string;
  url: string;
  name: string;
  created: number;
  tags: number[];
}
type Photos = Photo[];

const { useState } = React;

const Home = () => {
  const { tags = [] } = useConfig('options', {});

  const [data, setData] = useState<Photos>([]);
  useDidMount(async () => {
    const docRef = collection(db, 'photos');
    const unsubscribe = onSnapshot(
      query(docRef, orderBy('created', 'desc')),
      querySnapshot => {
        const data: Photos = [];
        querySnapshot.forEach(doc => {
          data.push({
            id: doc.id,
            ...doc.data()
          } as Photo);
        });
        setData(data);
      }
    );
    return () => {
      unsubscribe();
    };
  });

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.fast}>
          <TagGroup options={tags} />
        </div>
        <SettingIcon />
      </div>
      <div className={styles.container}>
        {data.map(item => (
          <div className={styles.photo} key={item.id}>
            <img src={item.url} alt={item.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Home);
