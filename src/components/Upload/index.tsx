import * as React from 'react';
import * as styles from './style.module.scss';
import type { ReactNode, ChangeEvent } from 'react';
import { doc, collection, setDoc } from 'firebase/firestore';
import { storage, db } from '@/utils/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import * as day from 'dayjs';
import alertConfirm from 'react-alert-confirm';
import { Icon, IconButton, TagGroup } from '@/components';
import { useConfig } from '@/hooks';

interface Props {
  children: ReactNode;
}

export const Upload = React.memo(({ children }: Props) => {
  const { tags = [] } = useConfig('options', {});

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const _fileList: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      _fileList.push(file);
    }
    let tagValue: number[] = [];
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
          <TagGroup options={tags} onChange={v => (tagValue = v)} />
        </div>
      ),
      footer(dispatch) {
        return (
          <div className={styles.footer}>
            <div className={styles.count}>已选择{_fileList.length}张图片</div>
            <IconButton
              size={16}
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
      const photoRef = doc(collection(db, 'photos'));
      setDoc(
        photoRef,
        {
          url,
          name: file.name,
          created: day().unix(),
          tags: tagValue
        },
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
});
