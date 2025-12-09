import { motion } from "framer-motion";

const MarqueeSection = () => {
  const text = "Welcome to DigiSence • Discover Amazing Businesses • Manage Your Profile • Transform Your Business • ";

  return (
    <section className="bg-linear-30  border mx-auto  from-cyan-950  via-55%  via-slate-950 to-cyan-900 py-5 relative ml-5  z-10 overflow-hidden w-full  sm:-mx-6 ">
      <motion.div
        className="whitespace-nowrap text-white text-6xl font-medium"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {text.repeat(2)}
      </motion.div>
    </section>
  );
};

export default MarqueeSection;