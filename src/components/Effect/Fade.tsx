import React from "react";
import PropTypes from "prop-types";
import { AnimatePresence, AnimationProps, motion } from "framer-motion";

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  id: string;
  delay?: number;
  visible: boolean;
  transition?: AnimationProps["transition"];
  preserve?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type: keyof typeof variants;
}

const variants = {
  from_big: {
    scale: 1.2,
    opacity: 0,
  },
  from_left: {
    x: -20,
    opacity: 0,
  },
  simple: {
    opacity: 0,
  },
  from_bottom: {
    y: 20,
    opacity: 0,
  },
  from_top: {
    y: -20,
    opacity: 0,
  },
  visible: {
    y: 0,
    x: 0,
    scale: 1,
    opacity: 1,
  },
};
const FadeIn: React.FC<Props> = ({
  id,
  type,
  delay,
  style,
  onClick,
  visible,
  children,
  className,
  preserve,
  transition,
}) => {
  if (preserve)
    return (
      <motion.span
        data-cy={id}
        key={id}
        style={style}
        initial={type}
        onClick={onClick}
        animate={(visible && "visible") || type}
        variants={variants}
        className={className + " block"}
        transition={{ type: "linear", delay, ...transition }}
      >
        {children}
      </motion.span>
    );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={id}
          exit={type}
          style={style}
          data-cy={id}
          initial={type}
          onClick={onClick}
          animate={"visible"}
          variants={variants}
          className={className}
          transition={{ type: "linear", delay, ...transition }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FadeIn;
