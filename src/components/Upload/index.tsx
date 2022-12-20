import React from 'react';
import styles from './style.module.scss';
import type { ReactNode, ChangeEvent } from 'react';
import { doc, collection, setDoc } from 'firebase/firestore';
import { storage, db } from '@/utils/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import day from 'dayjs';
import AlertConfirm from 'react-alert-confirm';
import { Icon, IconButton, TagGroup } from '@/components';
import { useConfig } from '@/hooks';

interface Props {
  children: ReactNode;
}

interface ImageData {
  result: string;
  width: number;
  height: number;
}

export const Upload = React.memo<Props>(({ children }) => {
  const { tags = [] } = useConfig('options', {});

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = e.target.files;
    const _fileList: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      _fileList.push(file);
    }
    let tagValue: number[] = [];
    const [isOk] = await AlertConfirm({
      maskClosable: true,
      className: styles.popup,
      title: (
        <div className={styles.title}>
          <Icon size={32} icon="biaoqian" />
          <span className={styles.text}>选择标签</span>
        </div>
      ),
      desc: (
        <div>
          <TagGroup options={tags} onChange={v => (tagValue = v)} />
        </div>
      ),
      footer(dispatch) {
        return (
          <div className={styles.footer}>
            <div className={styles.count}>已选择{_fileList.length}张图片</div>
            <IconButton
              size={46}
              onClick={() => dispatch('ok')}
              icon="shangchuan"
            />
          </div>
        );
      }
    });
    if (!isOk) return;
    for (let i = 0; i < _fileList.length; i++) {
      const file = _fileList[i];
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const { result, width, height }: ImageData = await new Promise(
          (resolve, reject) => {
            reader.onload = () => {
              const image = new Image();
              const result: string = reader.result as string;
              image.onload = () => {
                resolve({
                  result,
                  width: image.width,
                  height: image.height
                });
              };
              image.onerror = reject;
              image.src = result;
            };
          }
        );
        const [, suffix] = file.type.split('/');
        const fileRef = ref(storage, `photos/${day().unix()}.${suffix}`);
        await uploadString(fileRef, result, 'data_url');
        const url = await getDownloadURL(fileRef);
        const photoRef = doc(collection(db, 'photos'));
        setDoc(
          photoRef,
          {
            url,
            width,
            height,
            name: file.name,
            created: day().unix(),
            tags: tagValue
          },
          { merge: true }
        );
      } catch (e) {
        AlertConfirm.alert('部分图片上传失败！');
      }
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
});
