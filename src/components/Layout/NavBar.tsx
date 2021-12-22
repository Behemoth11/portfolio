import React, { useEffect, useState } from "react"
import { useNavContext } from "."
import * as styles from "./style.module.scss"
import { clamp } from "../../lib/utils"
import FadeIn from "../Effect/FadeIn"
import Burger from "../Icons/Burger"

interface Props {
  Links: string[]
  data: { [key: string]: object }
}

const THEMES = ["default", "dark", "white", "blue"]

export const NavBar: React.FC<Props> = ({ Links, data }) => {
  const { sections, currentSection, setCurrentSection } = useNavContext()
  const [open, setOpen] = React.useState(false)

  // const [theme, setTheme] = useState("default")

  const [visible, setVisible] = useState(true)

  const [shadow, setShadow] = useState(0)
  const old_scroll = React.useRef(0)

  const getScrollSpeed = (current, previousScroll) => {
    if (current < 100) return setVisible(true)
    if (current - previousScroll < -10) {
      setVisible(true)
    } else if (current - previousScroll > 10) {
      setVisible(false)
    }
  }

  const updateTheme = scrollTop => {
    let index = 0
    let height_threshold = 0
    // console.log( sections.current )

    if (scrollTop === 0) return setCurrentSection(0)

    for (const heights of sections.current) {
      const height = heights?.height || 0
      height_threshold += height
      if (height_threshold > scrollTop) break
      index++
    }
    // console.log(index, THEMES[index])
    // setTheme(THEMES[index])
    setCurrentSection(index)
  }

  const onScroll = e => {
    const scrollTop = e.target.scrollTop
    const height = e.target.clientHeight

    const threshold = 1000

    const opacity = clamp(scrollTop / threshold, 0, 0.25)

    setShadow(opacity)
    getScrollSpeed(scrollTop, old_scroll.current)
    updateTheme(scrollTop)

    old_scroll.current = scrollTop
  }

  useEffect(() => {
    const root = document.getElementById("gatsby-focus-wrapper")

    root.addEventListener("scroll", onScroll)
    ;() => root.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-40 ${styles.ctn} ${
          styles[THEMES[currentSection]]
        }`}
      >
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-0 `}>
          <div
            className={`p-2  ${styles.nav} `}
            style={{
              boxShadow: `0 25px 50px -12px rgba(0,0,0, ${shadow})`,
              // transform: visible && "translateY(0%)" || "translateY(-150%)"
            }}
          >
            <div
              className={`p-1 h-8 max-w-screen-lg m-auto rounded flex`}
              id="nav_header"
            >
              <Burger
                classNameBar={styles.burger_bar}
                className={"sm:hidden mr-auto"}
                state={open}
                onClick={() => setOpen(prev => !prev)}
              />

              <div className="">
                <p>
                  <a href="#Home">KODOH</a>
                </p>
              </div>

              <ul className="hidden m-auto mr-16 gap-16 sm:flex text-sm justify-between">
                {Links.map(link => (
                  <li key={link} className=" block">
                    <a href={`#${link}`} className={"w-full h-full block"}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <FadeIn
          visible={open}
          type={"from_big"}
          className={`md:hidden fixed flex flex-col  top-0 left-0 w-full h-screen bg-opacity-98 z-10 ${styles.overlay}`}
          // onClick={() => setOpen(prev => !prev)}
        >
          <div className="m-2 py-1 h-10 absolute">
            <Burger
              classNameBar={styles.burger_bar}
              className={"sm:hidden"}
              state={open}
              onClick={() => setOpen(prev => !prev)}
            />
          </div>
          <ul className="m-auto  text-center text-2xl pb-32">
            {Links.map((link, index) => (
              <FadeIn
                visible={open}
                key={link}
                type="from_bottom"
                delay={index / 10}
              >
                <li className={" py-4"}>
                  <a
                    href={`#${link}`}
                    className={"w-full h-full block"}
                    onClick={() => setOpen(prev => !prev)}
                  >
                    {link}
                  </a>
                </li>
              </FadeIn>
            ))}
          </ul>
        </FadeIn>
      </nav>
    </>
  )
}
