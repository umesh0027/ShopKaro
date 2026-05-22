// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";

// const NotFound = () => {
//   return (
//     <div className="min-h-screen  flex items-center justify-center bg-gradient-to-br from-pink-200 to-yellow-300 overflow-hidden relative">

//       {/* Floating Blobs */}
//       <div className="absolute w-72 h-72  bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full blur-3xl opacity-30 top-10 left-10 animate-pulse"></div>
//       <div className="absolute w-72 h-72 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full blur-3xl opacity-30 bottom-10 right-10 animate-pulse"></div>

//       {/* Main Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="relative z-10 backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-3xl p-10 text-center max-w-lg w-full"
//       >

//         {/* 404 Text */}
//         <motion.h1
//           initial={{ scale: 0.8 }}
//           animate={{ scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="text-7xl font-extrabold bg-gradient-to-br from-pink-400 to-yellow-500 text-transparent bg-clip-text"
//         >
//           404
//         </motion.h1>

//         {/* Subtitle */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//           className="mt-4 text-gray-600 text-lg"
//         >
//           Oops! Page not found 😢
//         </motion.p>

//         {/* Description */}
//         <p className="text-sm text-gray-500 mt-2">
//           The page you're looking for doesn't exist or has been moved.
//         </p>

//         {/* Animated Icon */}
//         <motion.div
//           animate={{ y: [0, -10, 0] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="text-6xl mt-6"
//         >
//           🚀
//         </motion.div>

//         {/* Button */}
//         <Link to="/">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-accent-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
//           >
//             Go Back Home
//           </motion.button>
//         </Link>

//       </motion.div>
//     </div>
//   );
// };

// export default NotFound;
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-yellow-300 overflow-hidden relative px-4">

      {/* Floating Blobs (responsive size) */}
      <div className="absolute w-40 h-40 sm:w-72 sm:h-72 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full blur-3xl opacity-30 top-5 left-2 sm:top-10 sm:left-10 animate-pulse"></div>
      <div className="absolute w-40 h-40 sm:w-72 sm:h-72 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full blur-3xl opacity-30 bottom-5 right-2 sm:bottom-10 sm:right-10 animate-pulse"></div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl sm:rounded-3xl 
        p-6 sm:p-10 text-center max-w-md sm:max-w-lg w-full"
      >

        {/* 404 Text */}
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-br from-pink-400 to-yellow-500 text-transparent bg-clip-text"
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg"
        >
          Oops! Page not found 😢
        </motion.p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Animated Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl sm:text-6xl mt-5 sm:mt-6"
        >
          🚀
        </motion.div>

        {/* Button */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-5 sm:mt-6 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 
            rounded-xl bg-gradient-to-r from-accent-600 to-accent-400 
            text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go Back Home
          </motion.button>
        </Link>

      </motion.div>
    </div>
  );
};

export default NotFound;