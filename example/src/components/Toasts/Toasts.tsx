import { AnimatePresence, motion, useAnimation, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActiveAlertData, Alert, useAlerts } from 'yah-ui';
import styles from './Toasts.module.scss';

let toastCount = 1;

export function Toasts() {
  const { alerts, add } = useAlerts();

  function toast() {
    add({ message: `TOAST ${toastCount++}` });
  }

  return (
    <div>
      <button onClick={() => toast()}>TOAST</button>
      <Toaster toasts={alerts} />
    </div>
  );
}

function Toaster({ toasts }: { toasts: ActiveAlertData[] }) {
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

function Toast({ pause, resume, close, message, duration }: ActiveAlertData) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const controls = useAnimation();

  const toastVariants = {
    enter: { y: '-200%', scale: 0.9, zIndex: 1 },
    visible: { y: 0, scale: 1 },
    exit: { y: '-200%', scale: 0.9, opacity: 0, zIndex: -1 },
  };

  const progressBarVariants: Variants = {
    initial: { scaleX: 1 },
    animate: {
      scaleX: 0,
      transition: { duration: duration / 1000, ease: 'linear' },
    },
    intialResume: { scaleX: timeRemaining / duration },
    resume: {
      scaleX: [timeRemaining / duration, 0],
      transition: {
        times: [0, 1],
        duration: timeRemaining / 1000,
        ease: 'linear',
      },
    },
  };

  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  return (
    <Alert
      className={styles.toast}
      as={motion.div}
      onMouseEnter={() => {
        setTimeRemaining(pause());
        controls.stop();
      }}
      onMouseLeave={() => {
        resume();
        controls.start('resume');
      }}
      variants={toastVariants}
      initial="enter"
      animate="visible"
      exit="exit"
    >
      <div>{message}</div>
      <button className={styles.closeButton} onClick={() => close()}>
        <span className={styles.srOnly}>close</span>×
      </button>
      <div className={styles.progressBarContainer}>
        <motion.div
          className={styles.progressBar}
          variants={progressBarVariants}
          initial="initial"
          animate={controls}
        />
      </div>
    </Alert>
  );
}
