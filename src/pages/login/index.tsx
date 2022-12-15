import React, { useState } from 'react';
import styles from './style.module.scss';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import AlertConfirm, { Button } from 'react-alert-confirm';
import { Input, Icon, Loading } from '@/components';
import { useDidMount } from '@/hooks';

const Login = () => {
  const [loading, setLoading] = useState(true);

  useDidMount(() => {
    onAuthStateChanged(auth, async () => {
      setLoading(false);
    });
  });

  const [logging, setLogging] = useState(false);
  const login = async ({ message = '手机号登陆' } = {}) => {
    let phoneNumber: string = '';
    setLogging(true);
    const [isOk] = await AlertConfirm({
      title: message,
      desc: (
        <Input
          style={{ marginTop: 2 }}
          onChange={value => (phoneNumber = value)}
          placeholder="请输入电话号码"
        />
      )
    });
    if (!isOk) {
      setLogging(false);
      return;
    }
    if (!phoneNumber) {
      login({ message: '请输入手机号码' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      login({ message: '手机号码格式错误' });
      return;
    }

    let closeRecaptcha: Function;
    AlertConfirm({
      custom(dispatch) {
        closeRecaptcha = () => dispatch(true);
        return (
          <div className={styles.recaptcha}>
            <div className={styles.phone}>手机号码：{phoneNumber}</div>
            <div id="recaptcha-container" className={styles.main} />
            <div className={styles.message}>
              <Loading text="验证信息加载中" />
            </div>
            <div className={styles.footer}>
              <Button onClick={() => dispatch(false)}>返回</Button>
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
            closeRecaptcha();
            try {
              const confirmationResult = await signInWithPhoneNumber(
                auth,
                `+86${phoneNumber}`,
                recaptchaVerifier
              );
              const confirm = async ({ message = '短信验证码' } = {}) => {
                let code: string = '';
                const [isOk] = await AlertConfirm({
                  title: message,
                  desc: (
                    <Input
                      style={{ marginTop: 2 }}
                      onChange={value => (code = value)}
                      placeholder={`验证码已发送至${phoneNumber}`}
                    />
                  )
                });
                if (!isOk) {
                  login();
                  return;
                }
                if (!code || !/^\d{6}$/.test(code)) {
                  confirm({
                    message: '请输入6位数短信验证码'
                  });
                  return;
                }
                try {
                  await confirmationResult.confirm(code);
                } catch (error: any) {
                  let loginMessage = error.message;
                  switch (error.code) {
                    case 'auth/invalid-verification-code':
                      confirm({
                        message: '短信验证码错误'
                      });
                      return;
                    case 'auth/expired-action-code':
                      loginMessage = '短信验证码过期，请重试';
                      break;
                  }
                  login({
                    message: loginMessage
                  });
                }
              };
              confirm();
            } catch (e) {
              login({ message: '验证码发送失败请重试' });
            }
          },
          'expired-callback': () => {
            closeRecaptcha();
            login({ message: '相应超时请重试' });
          }
        },
        auth
      );
      recaptchaVerifier.render();
    });
  };

  return (
    <div className={styles.login}>
      <div className={styles.logo}>
        <Icon icon="xiangce" />
      </div>
      <div className={styles.title}>相册</div>
      <div className={styles.loading}>
        {loading || logging ? (
          <Loading text={logging ? '登陆中' : '校验权限中'} />
        ) : (
          <Button
            className={styles.button}
            onClick={() => login()}
            styleType="primary"
          >
            登 陆
          </Button>
        )}
      </div>
      <div className={styles.tip}>请挂梯子后访问</div>
    </div>
  );
};

export default Login;
