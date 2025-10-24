import { motion } from 'motion/react';
import { GraduationCap, Users, BookOpen } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center space-y-8"
      >
        {/* Logo Animation */}
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">StudyBuddy</h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-muted-foreground"
          >
            Connect. Collaborate. Conquer.
          </motion.p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: [-8, 0, -8] }}
              transition={{
                duration: 1,
                delay: i * 0.2 + 1.2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-sm text-muted-foreground">Find your perfect study partner</p>
      </motion.div>
    </div>
  );
}