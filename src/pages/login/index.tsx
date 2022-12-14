import React from 'react';
import { Icon } from '@/components';
import styles from './style.module.scss';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import AlertConfirm, { Button, Dispatch } from 'react-alert-confirm';
import { Input, Spin } from '@/components';
import { useDidMount } from '@/hooks';

const login = async ({ message = '手机号登陆', placeholder = '' } = {}) => {
  let phoneNumber: string = '';
  await AlertConfirm.alert({
    title: message,
    desc: (
      <Input
        style={{ marginTop: 2 }}
        onChange={value => (phoneNumber = value)}
        placeholder={placeholder || '请输入电话号码'}
      />
    )
  });
  if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
    login({ message: '手机号码格式错误', placeholder: phoneNumber });
    return;
  }

  let recaptchaDispatch: Dispatch;
  AlertConfirm({
    custom(dispatch) {
      recaptchaDispatch = dispatch;
      return (
        <div className={styles.recaptcha}>
          <div id="recaptcha-container" className={styles.main} />
          <div className={styles.message}>
            <Spin className={styles.icon} />
            <span className={styles.text}>验证信息加载中</span>
          </div>
          <div className={styles.footer}>
            <Button onClick={() => dispatch(false)} className={styles.button}>
              返回
            </Button>
          </div>
        </div>
      );
    },
    onCancel: login
  });
  setTimeout(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'normal',
        callback: async () => {
          try {
            recaptchaDispatch(true);
            const confirmationResult = await signInWithPhoneNumber(
              auth,
              `+86${phoneNumber}`,
              recaptchaVerifier
            );
            const confirm = async ({
              message = '验证码',
              placeholder = ''
            } = {}) => {
              let code: string = '';
              await AlertConfirm.alert({
                title: message,
                desc: (
                  <Input
                    style={{ marginTop: 2 }}
                    onChange={value => (code = value)}
                    placeholder={placeholder || '请输入验证码'}
                  />
                )
              });
              if (!code || !/^\d{6}$/.test(code)) {
                confirm({
                  message: '请输入6位验证码',
                  placeholder: code
                });
                return;
              }
              confirmationResult.confirm(code).catch(() => {
                confirm({
                  message: '验证码错误'
                });
              });
            };
            confirm();
          } catch (e) {
            login({ message: '验证码发送失败请重试' });
          }
        }
      },
      auth
    );
    recaptchaVerifier.render();
  });
};

const Login = () => {
  useDidMount(() => {
    onAuthStateChanged(auth, async user => {
      if (!user) login();
    });
  });

  return (
    <div className={styles.login}>
      <div className={styles.logo}>
        <Icon icon="xiangce" />
      </div>
      <div className={styles.text}>相册</div>
      <div className={styles.loading}>
        <Spin />
        <span>加载中</span>
      </div>
      <div className={styles.tip}>请挂梯子后访问</div>
    </div>
  );
};

export default Login;
