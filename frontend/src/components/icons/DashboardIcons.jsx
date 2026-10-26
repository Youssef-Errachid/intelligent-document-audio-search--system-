import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

function createAnimatedIcon(renderIcon) {
  return forwardRef(function AnimatedIcon(
    { onMouseEnter, onMouseLeave, className, size = 28, ...props },
    ref
  ) {
    const controls = useAnimation()
    const isControlledRef = useRef(false)

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    }), [controls])

    const handleMouseEnter = useCallback((event) => {
      onMouseEnter?.(event)
      if (!isControlledRef.current) controls.start('animate')
    }, [controls, onMouseEnter])

    const handleMouseLeave = useCallback((event) => {
      onMouseLeave?.(event)
      if (!isControlledRef.current) controls.start('normal')
    }, [controls, onMouseLeave])

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {renderIcon(controls, size)}
      </div>
    )
  })
}

export const AudioLinesIcon = createAnimatedIcon((controls, size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 10v3" />
    <motion.path animate={controls} initial="normal" d="M6 6v11" variants={{
      normal: { d: 'M6 6v11' },
      animate: { d: ['M6 6v11', 'M6 10v3', 'M6 6v11'], transition: { duration: 1.5, repeat: Infinity } },
    }} />
    <motion.path animate={controls} initial="normal" d="M10 3v18" variants={{
      normal: { d: 'M10 3v18' },
      animate: { d: ['M10 3v18', 'M10 9v5', 'M10 3v18'], transition: { duration: 1, repeat: Infinity } },
    }} />
    <motion.path animate={controls} initial="normal" d="M14 8v7" variants={{
      normal: { d: 'M14 8v7' },
      animate: { d: ['M14 8v7', 'M14 6v11', 'M14 8v7'], transition: { duration: 0.8, repeat: Infinity } },
    }} />
    <motion.path animate={controls} initial="normal" d="M18 5v13" variants={{
      normal: { d: 'M18 5v13' },
      animate: { d: ['M18 5v13', 'M18 7v9', 'M18 5v13'], transition: { duration: 1.5, repeat: Infinity } },
    }} />
    <path d="M22 10v3" />
  </svg>
))

export const FileCheck2Icon = createAnimatedIcon((controls, size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <motion.path
      animate={controls}
      initial="normal"
      d="m3 15 2 2 4-4"
      variants={{
        normal: { pathLength: 1, opacity: 1 },
        animate: {
          pathLength: [0, 1],
          opacity: [0, 1],
          transition: { duration: 0.4, ease: 'easeInOut' },
        },
      }}
    />
  </svg>
))

export const SearchIcon = createAnimatedIcon((controls, size) => (
  <motion.svg
    animate={controls}
    initial="normal"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    variants={{
      normal: { x: 0, y: 0 },
      animate: { x: [0, 0, -3, 0], y: [0, -4, 0, 0] },
    }}
    transition={{ duration: 1, bounce: 0.3 }}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </motion.svg>
))

export const MessageCircleMoreIcon = createAnimatedIcon((controls, size) => {
  const dotVariants = {
    normal: { opacity: 1 },
    animate: (index) => ({
      opacity: [1, 0, 0, 1, 1, 0, 0, 1],
      transition: {
        opacity: {
          times: [
            0, 0.1, 0.1 + index * 0.1, 0.2 + index * 0.1,
            0.5, 0.6, 0.6 + index * 0.1, 0.7 + index * 0.1,
          ],
          duration: 1.5,
        },
      },
    }),
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      {[0, 1, 2].map((index) => (
        <motion.path
          key={index}
          animate={controls}
          custom={index}
          d={`M${8 + index * 4} 12h.01`}
          variants={dotVariants}
        />
      ))}
    </svg>
  )
})