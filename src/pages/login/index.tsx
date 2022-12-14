import React from 'react';
import { Icon } from '@/components';
import styles from './style.module.scss';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import AlertConfirm, { Button } from 'react-alert-confirm';
import { Input, Spin } from '@/components';

const login = async ({ message = '手机号登陆' } = {}) => {
  let phoneNumber: string = '';
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
  if (!isOk) return;
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
            <Spin className={styles.icon} />
            <span className={styles.text}>验证信息加载中</span>
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
              await AlertConfirm.alert({
                title: message,
                desc: (
                  <Input
                    style={{ marginTop: 2 }}
                    onChange={value => (code = value)}
                    placeholder="验证码已发送至手机短信"
                  />
                )
              });
              if (!code || !/^\d{6}$/.test(code)) {
                confirm({
                  message: '请输入6位数短信验证码'
                });
                return;
              }
              await confirmationResult.confirm(code).catch((error: any) => {
                let loginMessage = error.message;
                switch (error.message) {
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
              });
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

const Login = () => {
  return (
    <div className={styles.login}>
      <div className={styles.logo}>
        <Icon icon="xiangce" />
      </div>
      <div className={styles.text}>相册</div>
      <div className={styles.loading}>
        <Button onClick={() => login()} styleType="primary">
          登 陆
        </Button>
      </div>
      <div className={styles.tip}>请挂梯子后访问</div>
    </div>
  );
};

export default Login;
