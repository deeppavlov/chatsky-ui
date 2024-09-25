import { HTMLMotionProps, motion } from "framer-motion"
const MotionContent = ({ children, ...props }: HTMLMotionProps<"div">) => {
  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}>
        {children}
      </motion.div>
  )
}

export default MotionContent
