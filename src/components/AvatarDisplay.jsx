import Spline from '@splinetool/react-spline'
import { AnimatePresence, motion } from "framer-motion";
const AvatarDisplay = ({ selectedAvatar, Avatar }) => {
    const avatarData = Avatar[selectedAvatar]; // Lấy thông tin avatar từ object Avatar

    return (
        <div className=" relative md:w-4/4 w-full md:h-full h-80 -z-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedAvatar}
                    className="absolute inset-0"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.5 }}
                >
                    <Spline scene={avatarData.spline} />
                </motion.div>

            </AnimatePresence>
        </div>
    );
};
export default AvatarDisplay