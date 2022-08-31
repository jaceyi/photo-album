import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useDidMount } from '@/hooks';
import styles from './style.module.scss';
import SettingIcon, { TSettingIcon } from './components/SettingIcon';
import { TagGroup } from '@/components';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useConfig } from '@/hooks';
import Macy from 'macy';

export interface Photo {
  id: string;
  url: string;
  name: string;
  created: number;
  tags: number[];
}
type Photos = Photo[];

const Home = () => {
  const { tags = [] } = useConfig('options', {});
  const [tagValue, setTagValue] = useState([]);

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

  const [layoutCol, setLayoutCol] = useState(2);
  const handleSetting = useCallback<TSettingIcon.onSelect>(({ type }) => {
    if (type === 'layout') {
      setLayoutCol(v => {
        let c = v + 1;
        if (c > 3) c = 1;
        return c;
      });
    }
  }, []);

  const macyRef = useRef<any>();
  const containerRef = useRef(null);
  useEffect(() => {
    const macy: any = new Macy({
      container: containerRef.current,
      columns: layoutCol,
      margin: 10
    });
    macyRef.current = macy;
  }, [layoutCol]);

  const dataSource = useMemo(() => {
    if (!tagValue.length) return data;
    return data.filter(item => tagValue.find(tag => item.tags.includes(tag)));
  }, [data, tagValue]);

  useEffect(() => {
    macyRef.current.runOnImageLoad(() => {
      macyRef.current.recalculate(true);
    }, true);
  }, [dataSource]);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.fast}>
          <TagGroup options={tags} value={tagValue} onChange={setTagValue} />
        </div>
        <SettingIcon onSelect={handleSetting} />
      </div>
      <div ref={containerRef} className={styles.container}>
        {dataSource.map(item => (
          <div key={item.id} className={styles.col}>
            <div className={styles.photo}>
              <img src={item.url} alt={item.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Home);
