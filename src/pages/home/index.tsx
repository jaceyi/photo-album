import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useDidMount, useScrollEnd } from '@/hooks';
import styles from './style.module.scss';
import SettingIcon, { TSettingIcon } from './components/SettingIcon';
import { IconLoading, TagGroup } from '@/components';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useConfig } from '@/hooks';
import Macy from 'macy';
import LocalDB from '@/libs/LocalDB';
import { useSpring, animated } from '@react-spring/web';
import { PhotoProvider, PhotoView } from 'react-photo-view';

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

  const [fullData, setFullData] = useState<Photos>([]);
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
        setFullData(data);
        setData(data.slice(0, 10));
      }
    );
    return () => {
      unsubscribe();
    };
  });
  const [loadingEnd, setLoadingEnd] = useState(false);
  const loadingEndStyle = useSpring({
    marginBottom: loadingEnd ? -100 : 0
  });
  useScrollEnd(
    count => {
      return new Promise((resolve, reject) => {
        let newData: Photos = [];
        setData(data => {
          newData = [...data, ...fullData.slice(count * 10, (count + 1) * 10)];
          return newData;
        });
        if (newData.length >= fullData.length) {
          setLoadingEnd(true);
          reject('scroll end');
        } else {
          setLoadingEnd(false);
          resolve(newData);
        }
      });
    },
    [fullData]
  );

  const [layoutCol, setLayoutCol] = useState<number>(
    () => LocalDB.get('layoutCol') || 2
  );
  useEffect(() => {
    LocalDB.set('layoutCol', layoutCol);
  }, [layoutCol]);
  const [tagVisible, setTagVisible] = useState<boolean>(
    () => LocalDB.get('tagVisible') || false
  );
  useEffect(() => {
    LocalDB.set('tagVisible', tagVisible);
  }, [tagVisible]);
  const tagStyles = useSpring({
    y: tagVisible ? 0 : -60
  });
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const handleSetting = useCallback<TSettingIcon.onSelect>(({ type }) => {
    switch (type) {
      case 'layout':
        setLayoutCol(v => {
          let c = v + 1;
          if (c > 3) c = 1;
          return c;
        });
        break;
      case 'tag':
        setTagVisible(v => !v);
        break;
      case 'play':
        setVisible(true);
        setPlaying(true);
        break;
    }
  }, []);

  const macyRef = useRef<any>();
  const mainRef = useRef(null);
  useEffect(() => {
    const macy: any = new Macy({
      container: mainRef.current,
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
    setIndex(0);
    macyRef.current.runOnImageLoad(() => {
      macyRef.current.recalculate(true);
    }, true);
  }, [dataSource]);

  const playTimer = useRef<number>(0);
  useEffect(() => {
    if (visible && playing) {
      clearInterval(playTimer.current);
      playTimer.current = window.setInterval(() => {
        setIndex(i => (i === dataSource.length - 1 ? 0 : i + 1));
      }, 3000);
      return;
    }
    if (!visible && playing) {
      clearInterval(playTimer.current);
      setPlaying(false);
    }
  }, [visible, playing, dataSource]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.fast}>
          <animated.div style={tagStyles}>
            <TagGroup options={tags} value={tagValue} onChange={setTagValue} />
          </animated.div>
        </div>
        <SettingIcon onSelect={handleSetting} />
      </div>
      <PhotoProvider
        visible={visible}
        onVisibleChange={(visible, index) => {
          setVisible(visible);
          visible && setIndex(index);
        }}
        index={index}
        onIndexChange={setIndex}
      >
        <div ref={mainRef} className={styles.main}>
          {dataSource.map((item, index) => (
            <div key={`${item.id}-${index}`} className={styles.col}>
              <PhotoView src={item.url}>
                <img src={item.url} alt="" />
              </PhotoView>
            </div>
          ))}
        </div>
      </PhotoProvider>
      <animated.div style={loadingEndStyle} className={styles.loading}>
        <IconLoading />
        <span>加载中</span>
      </animated.div>
    </div>
  );
};

export default React.memo(Home);
