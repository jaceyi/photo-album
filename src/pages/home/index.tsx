import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useDidMount } from '@/hooks';
import styles from './style.module.scss';
import SettingIcon, { onSettingSelect } from './components/SettingIcon';
import LoadPhoto, { Photo } from './components/LoadPhoto';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useConfig, useLocalValue } from '@/hooks';
import PlanLayout from '@/libs/PlanLayout';
import { useSpring, animated } from '@react-spring/web';
import { PhotoSlider } from 'react-photo-view';
import { TagGroup, IconButton, Loading } from '@/components';
import AlertConfirm, { Button } from 'react-alert-confirm';

type Photos = Photo[];

const Home = () => {
  // db
  const [data, setData] = useState<Photos>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [footerText, setFooterText] = useState('');
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
      },
      err => {
        setErrorMessage(err.message);
      }
    );

    {
      const docRef = doc(db, 'config', 'footer');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFooterText(docSnap.data().text);
      }
    }
    return () => {
      unsubscribe();
    };
  });
  const [loadingEnd, setLoadingEnd] = useState(false);
  const loadingEndStyle = useSpring({
    height: loadingEnd ? 0 : 60,
    opacity: loadingEnd ? 0 : 1
  });

  // layout
  const mainRef = useRef(null);
  const [planLayout, setPlanLayout] = useState<PlanLayout>();
  const [layoutCol, setLayoutCol] = useLocalValue<number>('layoutCol', 2);
  useEffect(() => {
    if (!mainRef.current) return;
    setPlanLayout(
      new PlanLayout({
        container: mainRef.current,
        columns: layoutCol,
        margin: 10
      })
    );
  }, [layoutCol]);

  // tag
  const [tagVisible, setTagVisible] = useLocalValue<boolean>(
    'tagVisible',
    false
  );
  const tagStyles = useSpring({
    y: tagVisible ? 0 : -60
  });
  const { tags = [] } = useConfig('options', {});
  const [tagValue, setTagValue] = useLocalValue<[]>('tagValue', []);
  const dataSource = useMemo(() => {
    if (!tagValue.length) return data;
    return data.filter(item => tagValue.find(tag => item.tags.includes(tag)));
  }, [data, tagValue]);

  useEffect(() => {
    if (!planLayout) return;
    if (dataSource.length) {
      planLayout.dispatchComputeBefore();
      planLayout.recalculate(true);
      planLayout.dispatchComputeAfter();
    }
  }, [dataSource, planLayout]);

  // view and play
  const playTimer = useRef<number>(0);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (dataSource.length) {
      setLoadingEnd(false);
      setIndex(index => {
        if (dataSource[index]) return index;
        return index - 1;
      });
    }
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

  const handleSetting = useCallback<onSettingSelect>(({ type }) => {
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
      case 'sort':
        setData(data => [...data.reverse()]);
        break;
    }
  }, []);

  const handleDelete = async () => {
    const [isOk] = await AlertConfirm({
      title: '确认删除该照片？',
      desc: '删除后也可以再恢复哦~'
    });
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
          <Button styleType="danger" onClick={() => (window as any).signOut()}>
            退出登录
          </Button>
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
          <div key={item.id} className={styles.col}>
            <LoadPhoto
              data={item}
              planLayout={planLayout}
              onClick={() => {
                setVisible(true);
                setIndex(index);
              }}
              onLoadEnd={() => {
                !loadingEnd &&
                  index === dataSource.length - 1 &&
                  setLoadingEnd(true);
              }}
            />
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
            <div className={styles.delete}>
              <IconButton onClick={handleDelete} icon="qingchu" size={38} />
            </div>
          );
        }}
      />
      <animated.div style={loadingEndStyle} className={styles.loading}>
        <Loading />
      </animated.div>
      {!!footerText && <div className={styles.footer}>{footerText}</div>}
    </div>
  );
};

export default React.memo(Home);
