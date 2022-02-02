import {
  AnimationProps,
  HTMLMotionProps,
  motion,
  TargetAndTransition,
  useAnimation,
} from "framer-motion";
import { HTMLMotionComponents } from "framer-motion/types/render/html/types";
import { TargetWithKeyframes } from "framer-motion/types/types";
import React, { ReactHTML } from "react";
import {
  useFirstTimeLoading,
  useSequentialState,
  useSyncRef,
} from "../../lib/hooks";
import PageIcon from "./PageIcon";

type h = keyof ReactHTML;

interface Props extends HTMLMotionProps<any> {
  textClass?: string;
}

const kRestPath =
  "M163.885 250.395C163.885 250.395 163.619 250.395 163.088 250.395C154.985 250.395 148.21 246.542 142.763 238.838L88.5641 161.325C85.2431 156.543 80.7265 154.019 75.0143 153.753C69.435 153.62 64.7192 155.812 60.8668 160.329H60.4683V220.705C60.4683 228.941 57.5458 235.982 51.7008 241.827C45.8558 247.672 38.9481 250.528 30.9776 250.395H30.7784C22.5422 250.395 15.5017 247.539 9.65667 241.827C3.81168 235.982 0.889181 228.941 0.889181 220.705V30.2112C0.889181 22.2408 3.81168 15.333 9.65667 9.48803C15.5017 3.64304 22.5422 0.720541 30.7784 0.720541H30.9776C38.9481 0.720541 45.8558 3.64304 51.7008 9.48803C57.5458 15.333 60.4683 22.2408 60.4683 30.2112V73.4509C60.4683 77.3033 61.5974 79.5616 63.8557 80.2258C65.9812 81.0228 67.6417 80.5579 68.8373 78.8309L115.863 13.8718C120.778 6.29985 127.686 2.51389 136.586 2.51389H137.184C147.014 2.51389 154.187 6.83122 158.704 15.4659C163.221 24.1005 162.955 32.5359 157.907 40.772L129.213 86.8014C120.712 100.484 120.712 113.834 129.213 126.853L184.807 211.937C190.121 220.174 190.387 228.609 185.604 237.244C180.822 246.011 173.582 250.395 163.885 250.395Z";
const kTransitionPath =
  "M 164 250 C 163 250 163 250 162 250 C 155 250 149 250 132 250 L 93 250 C 85 250 75 250 74 250 C 74 250 68 250 68 250 H 62 V 250 C 60 250 57 250 48 250 C 42 250 40 250 31 250 H 26 C 22 250 15 250 0 250 C 0 237 0 229 0 221 V 28.001 C 0 23 0 13 0 0 C 15 0 19 0 31 0 H 34 C 38 0 42 0 45 0 C 45 0 49 0 51 0 V 0 C 63 0 66 0 67 0 C 68 0 74 0 80 0 L 114 0 C 125 0 126 0 136 0 H 139 C 148 0 154 0 197 0 C 197 23 197 -2 197 46 L 197 97 C 197 112 197 120 197 130 L 197 214 C 197 228 197 236 197 250 C 175 250 173 250 166 250 Z";

type AnimationStates = typeof animationStates;
const animationStates = [
  "rest",
  "offset",
  "center",
  "centerShow",
  "bgFull",
  "wordFull",
  "bgFull",
  "centerShow",
  "center",
  "offset",
  "rest",
] as const;

type AnimationDependencies = {
  ctn?: DOMRect;
  window?: Window;
};

type VariantReturn = TargetWithKeyframes & { method?: "start" | "set" };
type Variants = {
  [K in typeof animationStates[number]]?: (
    window: Window,
    ctn: DOMRect
  ) => VariantReturn;
};

const bgVariants: Variants = {
  rest: (window, ctn) => {
    if (!window || !ctn) return {};
    const subSize = Math.max(window.innerWidth, window.innerHeight) * 1.5;

    return {
      x: ctn.x,
      opacity: 1,
    };
  },
  offset: (window, ctn) => {
    if (!window || !ctn) return {};
    const subSize = Math.max(window.innerWidth, window.innerHeight) * 1.5;

    return {
      opacity: 0,
      x: ctn.x - ctn.x * 2,
      y: ctn.y,
      scale: 1,
    };
  },
  center: (window, ctn) => {
    return {
      x: window.innerWidth / 2 - ctn.width / 2,
      y: window.innerHeight / 2 - ctn.height / 2,
      backgroundColor: "#1f1c24",
      method: "set",
    };
  },
  centerShow: (window, ctn) => {
    return {
      opacity: 1,
      scale: 3,
    };
  },
  bgFull: (window, ctn) => {
    if (!window || !ctn) return {};

    const subSize = Math.max(window.innerWidth, window.innerHeight) * 1.5;

    return {
      transition: { duration: 2 },
      scale: subSize / ctn.height,
      backgroundColor: "#0d0d0d",
      opacity: 1,
    };
  },
};

const kVariants: Variants = {
  wordFull: () => {
    return {
      scale: 30,
      w: "7em",
    };
  },
};

const parseDimension = (client?: DOMRect) => {
  const h = client?.height || 0;
  const w = client?.width || 0;

  const y = client?.y || 0;
  const x = client?.x || 0;

  return {
    x: x + w / 2,
    y: y + h / 2,
    h,
    w,
  };
};

const PageIconAnimated: React.FC<Props> = ({
  textClass,
  className,
  ...props
}) => {
  const ctnRef = React.useRef<HTMLDivElement>(null);
  const [animationState, updateAnimationState] =
    useSequentialState(animationStates);

  const [state, setState] = React.useState<-1 | 1>(-1);
  const stateRef = useSyncRef(state);

  const ctnBound = parseDimension(ctnRef?.current?.getBoundingClientRect());

  const bgController = useAnimation();
  const kController = useAnimation();

  React.useEffect(() => {
    const animate = async () => {
      const getBg = bgVariants[animationState] || (() => ({}));
      const getK = kVariants[animationState] || (() => ({}));

      const container = ctnRef.current?.getBoundingClientRect() as DOMRect;

      let bgStyle = getBg(window, container) as VariantReturn;
      let kStyle = getK(window, container) as VariantReturn;

      await Promise.all([
        bgController[bgStyle.method || "start"](bgStyle),
        kController[kStyle.method || bgStyle.method || "start"]({
          ...bgStyle,
          scale: 1,
          ...kStyle,
        }),
      ]);

      updateAnimationState(state);
    };

    animate();
  }, [animationState]);

  return (
    <div
      className={`${className} h-full relative`}
      ref={ctnRef}
      onClick={() => {
        setState((prev) => {
          const newState = prev === 1 ? -1 : 1;
          updateAnimationState(newState);
          return newState;
        });
      }}
    >
      <PageIcon className={`${className} h-full opacity-0`} />

      <motion.div
        animate={bgController}
        className={`${className} fixed  `}
        style={{
          backgroundColor: "#1F1C24",
          top: 0,
          left: 0,
          borderRadius: "20%",
          x: -ctnBound.w / 2 + ctnBound.x,
          y: -ctnBound.h / 2 + ctnBound.y,
          height: ctnBound.h,
          width: ctnBound.w,
        }}
        {...props}
      ></motion.div>

      <motion.div
        animate={kController}
        className="fixed"
        style={{
          top: 0,
          left: 0,
          width: ctnBound.w,
          height: ctnBound.h,
          borderRadius: "20%",
          y: -ctnBound.h / 2 + ctnBound.y,
          x: -ctnBound.w / 2 + ctnBound.x,
        }}
      >
        <svg
          className=" transition-height inline-block h-full w-auto absolute top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2"
          width="512"
          height="512"
          viewBox="-17 -80 200 400"
          fill="none"
        >
          <path d={`${kRestPath}`} fill="white">
            <animate
              dur="5s"
              repeatCount="indefinite"
              attributeName="d"
              values={`${kTransitionPath};${kRestPath};${kTransitionPath}`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            ></animate>
          </path>
        </svg>
      </motion.div>
    </div>
  );
};

export default PageIconAnimated;