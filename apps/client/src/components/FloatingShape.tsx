import { motion } from "framer-motion";

type TProps = {
  color: string;
  size: string;
  top: string;
  left: string;
  delay: number;
};

const FloatingShape = ({ color, size, top, left, delay }: TProps) => {
  return (
    <motion.div
      className={`absolute rounded-full ${color} ${size} opacity-20 blur-xl`}
      style={{ top, left }}
      animate={{
        y: ["0%", "100%", "0%"],
        x: ["0%", "100%", "0%"],
        rotate: [0, 360],
      }}
      transition={{
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        delay,
      }}
      aria-hidden="true"
    />
  );
};
export default FloatingShape;
