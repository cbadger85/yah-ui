import { AnimatePresence, motion, useAnimation, Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActiveNotificationData, Notification, useNotifications } from 'yah-ui';
import styles from './Toasts.module.scss';

let toastCount = 1;

export function Toasts() {
  const { notifications, add } = useNotifications();

  function toast() {
    add({ type: 'info', message: `TOAST ${toastCount++}` });
  }

  return createPortal(
    <div>
      <button onClick={() => toast()}>TOAST</button>
      <Toaster toasts={notifications} />
    </div>,
    document.getElementById('toast-root') as HTMLElement,
  );
}

export function Toaster({ toasts }: { toasts: ActiveNotificationData[] }) {
  return createPortal(
    <div className={styles.toaster}>
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>,
    document.getElementById('toast-root') as HTMLElement,
  );
}

function Toast({
  pause,
  resume,
  close,
  message,
  delay,
}: ActiveNotificationData) {
  const [timeRemaining, setTimeRemaining] = useState(delay);
  const controls = useAnimation();

  const notificationVariants = {
    enter: { y: '-120%', opacity: 0.5, zIndex: 1 },
    visible: { y: 0, opacity: 1 },
    exit: { y: '-120%', opacity: 0.5, zIndex: -1 },
  };

  const progressBarVariants: Variants = {
    initial: { scaleX: 1 },
    animate: {
      scaleX: 0,
      transition: { duration: delay / 1000, ease: 'linear' },
    },
    intialResume: { scaleX: timeRemaining / delay },
    resume: {
      scaleX: 0,
      transition: { duration: timeRemaining / 1000, ease: 'linear' },
    },
  };

  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  return (
    <Notification
      className={styles.toast}
      as={motion.div}
      onMouseEnter={() => {
        setTimeRemaining(pause());
        controls.stop();
      }}
      onMouseLeave={() => {
        resume();
        controls.set('intialResume');
        controls.start('resume');
      }}
      variants={notificationVariants}
      initial="enter"
      animate="visible"
      exit="exit"
    >
      <div>{message}</div>
      <button onClick={() => close()}>Close</button>
      <div className={styles.progressBarContainer}>
        <motion.div
          className={styles.progressBar}
          variants={progressBarVariants}
          initial="initial"
          animate={controls}
        />
      </div>
    </Notification>
  );
}
