import * as React from 'react';
import { useDidMount } from '@/hooks';
import * as styles from './style.module.scss';
import SettingIcon from './components/SettingIcon';
import { TagGroup } from '@/components';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

const {} = 'react';

const docRef = collection(db, 'photos');

const Home = () => {
  useDidMount(async () => {
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
    });
  });

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.fast}></div>
        <SettingIcon />
      </div>
      <div>
        <TagGroup
          options={[
            {
              label: '正经图',
              value: 1
            },
            {
              label: '涩涩的',
              value: 2
            },
            {
              label: '不对劲',
              value: 3
            }
          ]}
        />
      </div>
    </div>
  );
};

export default React.memo(Home);
