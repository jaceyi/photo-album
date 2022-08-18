import * as React from 'react';
import * as styles from './style.module.scss';
import type { ReactNode, ChangeEvent } from 'react';
import { doc, collection, setDoc } from 'firebase/firestore';
import { storage, db } from '@/utils/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import * as day from 'dayjs';
import alertConfirm from 'react-alert-confirm';
import { Icon, IconButton, TagGroup } from '@/components';

interface Props {
  children: ReactNode;
}

const photoRef = doc(collection(db, 'photos'));

const Upload = ({ children }: Props) => {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const [isOk] = await alertConfirm({
      maskClosable: true,
      className: styles.popup,
      title: (
        <div className={styles.title}>
          <Icon size={12} icon="biaoqian" />
          <span className={styles.text}>选择标签</span>
        </div>
      ),
      content: (
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
      ),
      footer(dispatch) {
        return (
          <IconButton
            size={16}
            onClick={() => dispatch('ok')}
            icon="shangchuan"
          />
        );
      }
    });
    if (!isOk) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const src: string = await new Promise(reslove => {
        reader.onload = () => {
          reslove(reader.result as string);
        };
      });
      const [, suffix] = file.type.split('/');
      const fileRef = ref(storage, `photos/${day().unix()}.${suffix}`);
      await uploadString(fileRef, src, 'data_url');
      const url = await getDownloadURL(fileRef);
      setDoc(
        photoRef,
        { url, name: file.name, created: day().unix() },
        { merge: true }
      );
    }
  };

  return (
    <label>
      <input
        value={[]}
        multiple
        className={styles.input}
        onChange={handleUpload}
        type="file"
        name="file"
        accept="image/png, image/jpeg, image/jpg, image/gif"
      />
      {children}
    </label>
  );
};

export default React.memo(Upload);
