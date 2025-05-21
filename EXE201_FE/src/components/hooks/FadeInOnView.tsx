import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeInOnView: React.FC<Props> = ({ children, delay = 0.3, className }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: false });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 20 });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeInOnView;
