import {
  AnimatePresence,
  AnimationControls,
  motion,
  useAnimation,
  Variants,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActiveAlertData, Alert, mergeAttributes, useAlerts } from 'yah-ui';
import styles from './Toasts.module.scss';

let toastCount = 1;

const toastTypeClasses = {
  info: 'Info',
  success: 'Success',
  warn: 'Warn',
  error: 'Error',
};

type ToastData = { type: keyof typeof toastTypeClasses; text: string };

export function Toasts() {
  const { alerts, add } = useAlerts<ToastData>({ limit: Infinity });

  function toast() {
    add({ message: { type: 'error', text: `TOAST ${toastCount++}` } });
  }

  return (
    <div>
      <button onClick={() => toast()}>TOAST</button>
      <Toaster toasts={alerts} />
    </div>
  );
}

function Toaster({ toasts }: { toasts: ActiveAlertData<ToastData>[] }) {
  return createPortal(
    <div className={styles.toaster}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>,
    document.getElementById('toast-root') as HTMLElement,
  );
}

function Toast({
  pause,
  resume,
  close,
  message,
  duration,
}: ActiveAlertData<ToastData>) {
  const [timeRemaining, setTimeRemaining] = useState<number>(duration || 0);
  const controls = useAnimation();

  const toastVariants = {
    enter: { scale: 0.75, zIndex: 1, y: -200 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: 'spring', bounce: 0.5 },
    },
    exit: {
      scale: 0.75,
      opacity: 0,
      zIndex: -1,
      y: -200,
      transition: { duration: 0.1 },
    },
  };

  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  return (
    <Alert
      className={mergeAttributes(
        styles.toast,
        styles[`toast${toastTypeClasses[message.type]}`],
      )}
      as={motion.div}
      onMouseEnter={() => {
        setTimeRemaining(pause());
        controls.stop();
      }}
      onMouseLeave={() => {
        resume();
        controls.start('resume');
      }}
      layout="position"
      transition={{ type: 'spring', duration: 0.3, bounce: 0.5, delay: 0.1 }}
      variants={toastVariants}
      initial="enter"
      animate="visible"
      exit="exit"
    >
      <div>{message.text}</div>
      <button
        className={mergeAttributes(
          styles.closeButton,
          styles[`closeButton${toastTypeClasses[message.type]}`],
        )}
        onClick={() => close()}
      >
        <span className={styles.srOnly}>close</span>×
      </button>
      <ProgressBar
        duration={duration || 0}
        timeRemaining={timeRemaining}
        controls={controls}
        className={styles[`progressBar${toastTypeClasses[message.type]}`]}
      />
    </Alert>
  );
}

function ProgressBar({
  duration,
  timeRemaining,
  controls,
  className,
}: {
  duration: number;
  timeRemaining: number;
  controls: AnimationControls;
  className?: string;
}) {
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

  return (
    <div className={styles.progressBarContainer}>
      <motion.div
        className={mergeAttributes(styles.progressBar, className)}
        variants={progressBarVariants}
        initial="initial"
        animate={controls}
      />
    </div>
  );
}
