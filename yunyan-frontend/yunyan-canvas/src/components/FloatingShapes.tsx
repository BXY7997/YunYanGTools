import { motion } from "framer-motion";
import { Database, Server, Smartphone, Laptop, Cloud, Users, Globe, Lock } from "lucide-react";

const OrbitingNode = ({ icon: Icon, angle, radius, color, duration = 20 }: any) => {
  return (
    <motion.div
        className="absolute left-1/2 top-1/2 w-0 h-0 flex items-center justify-center pointer-events-none"
        animate={{ 
            rotate: 360,
        }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        style={{ rotate: angle }}
    >
        <motion.div
            animate={{ 
                x: [radius, radius * 1.1, radius], // Breathing radius
            }}
            transition={{ 
                duration: duration / 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
        >
             <motion.div
                className={`flex items-center justify-center p-3 rounded-xl shadow-lg border bg-background/80 backdrop-blur-sm ${color}`}
                animate={{ 
                    rotate: -360,
                    y: [0, -10, 0], // Bobbing up and down
                }}
                transition={{ 
                    rotate: { duration, repeat: Infinity, ease: "linear" },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ rotate: -angle, width: "3rem", height: "3rem" }}
             >
                <Icon className="w-6 h-6" />
             </motion.div>
        </motion.div>
    </motion.div>
  )
}

export const FloatingShapes = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-visible">
      {/* Central Hub */}
      <motion.div
        className="z-20 bg-primary/10 text-primary p-6 rounded-2xl shadow-xl border-2 border-primary/20 backdrop-blur-md relative"
        animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 0px rgba(59, 130, 246, 0)"
            ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Database className="w-12 h-12" />
        <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 rounded-full" />
      </motion.div>

      {/* Orbit Rings - Adjusted for compact layout */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <motion.div 
            className="w-[160px] h-[160px] rounded-full border border-dashed border-foreground/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <motion.div 
            className="w-[280px] h-[280px] rounded-full border border-foreground/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Orbiting Icons - Inner Ring (Radius 80) */}
      <OrbitingNode icon={Server} angle={0} radius={80} color="text-blue-500" duration={25} />
      <OrbitingNode icon={Smartphone} angle={120} radius={80} color="text-green-500" duration={25} />
      <OrbitingNode icon={Laptop} angle={240} radius={80} color="text-purple-500" duration={25} />

      {/* Orbiting Icons - Outer Ring (Radius 140) */}
      <OrbitingNode icon={Cloud} angle={45} radius={140} color="text-orange-500" duration={40} />
      <OrbitingNode icon={Users} angle={135} radius={140} color="text-red-500" duration={40} />
      <OrbitingNode icon={Globe} angle={225} radius={140} color="text-cyan-500" duration={40} />
      <OrbitingNode icon={Lock} angle={315} radius={140} color="text-indigo-500" duration={40} />
      
    </div>
  );
};
