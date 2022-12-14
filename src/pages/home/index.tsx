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
import { Spin, TagGroup } from '@/components';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useConfig } from '@/hooks';
import Macy from 'macy';
import LocalDB from '@/libs/LocalDB';
import { useSpring, animated } from '@react-spring/web';
import { PhotoSlider } from 'react-photo-view';
import { IconButton } from '@/components';
import AlertConfirm from 'react-alert-confirm';

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
  const [errorMessage, setErrorMessage] = useState('');
  useDidMount(async () => {
    const docRef = collection(db, 'photos');
    const unsubscribe = onSnapshot(
      query(docRef, orderBy('created', 'desc')),
      querySnapshot => {
        const fullData: Photos = [];
        querySnapshot.forEach(doc => {
          fullData.push({
            id: doc.id,
            ...doc.data()
          } as Photo);
        });
        setFullData(fullData);
      },
      err => {
        setErrorMessage(err.message);
      }
    );
    return () => {
      unsubscribe();
    };
  });
  useEffect(() => {
    setData(data => {
      return fullData.slice(0, data.length < 10 ? 10 : data.length);
    });
  }, [fullData]);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const loadingEndStyle = useSpring({
    marginBottom: loadingEnd ? -100 : 0
  });
  useScrollEnd(() => {
    return new Promise((resolve, reject) => {
      let newData: Photos = [];
      setData(data => {
        newData = [...data, ...fullData.slice(data.length, data.length + 10)];
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
  }, [fullData]);

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
    if (dataSource.length) {
      setIndex(index => {
        if (dataSource[index]) return index;
        return index - 1;
      });
      macyRef.current.runOnImageLoad(() => {
        macyRef.current.recalculate(true);
      }, true);
    }
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

  const handleDelete = async () => {
    const [isOk] = await AlertConfirm('确认删除该照片？');
    if (isOk) {
      const active = data[index];
      if (!active) return;
      deleteDoc(doc(db, 'photos', active.id));
    }
  };

  if (errorMessage) {
    return (
      <div className={styles.error}>
        <h2>错误：</h2>
        <p>{errorMessage}</p>
        <div>
          <a href="/">返回重试</a>
        </div>
      </div>
    );
  }

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
      <div ref={mainRef} className={styles.main}>
        {dataSource.map((item, index) => (
          <div key={`${item.id}-${index}`} className={styles.col}>
            <div
              onClick={() => {
                setVisible(true);
                setIndex(index);
              }}
              className={styles.photo}
            >
              <img src={item.url} alt="" />
            </div>
          </div>
        ))}
      </div>
      <PhotoSlider
        images={dataSource.map((item, index) => ({
          src: item.url,
          key: `${item.id}-${index}`
        }))}
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        index={index}
        onIndexChange={setIndex}
        toolbarRender={() => {
          return (
            <div style={{ marginRight: 10 }}>
              <IconButton onClick={handleDelete} icon="qingchu" size={38} />
            </div>
          );
        }}
      />
      <animated.div style={loadingEndStyle} className={styles.loading}>
        <Spin />
        <span>加载中</span>
      </animated.div>
    </div>
  );
};

export default React.memo(Home);
