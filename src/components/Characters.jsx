import React, { useEffect, useRef, useState } from 'react';
import { Rows, Star } from "lucide-react";
import CardList from './CardList';
import AvatarDisplay from './AvatarDisplay';
import { motion } from "framer-motion";
const Characters = () => {
    //customCursor 
    function CustomCursor({ isHovering3D }) {
        const [position, setPosition] = useState({ x: 0, y: 0 })
        const cursorRef = useRef(null)
        useEffect(() => {
            const handleMouseMove = (e) => {
                setPosition({ x: e.clientX, y: e.clientY })
            }
            document.addEventListener("mousemove", handleMouseMove)
            return () => {
                document.removeEventListener("mousemove", handleMouseMove)
            }
        })
        return <motion.div
            ref={cursorRef}
            className="fixed top-0 left-0 z-50 pointer-events-none mix-blend-difference"
            animate={{
                x: position.x - (isHovering3D ? 12 : 15),
                y: position.y - (isHovering3D ? 12 : 15),
                scale: isHovering3D ? 1.5 : 1
            }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
                mass: 0.5
            }}
        >
            <motion.div
                className={`rounded-full ${isHovering3D ? "bg-violet-500" : "bg-white"}`}
                animate={{
                    width: isHovering3D ? "24px" : "40px",
                    height: isHovering3D ? "24px" : "40px",
                }}
                transition={{ duration: 0.2 }}
            />
            {isHovering3D && (
                <motion.div
                    className='absolute inset-0 rounded-full bg-transition border border-violet-500'
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0.5 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
            )}
        </motion.div>
    }
    // Track which Avatar is selected
    const [selectedAvatar, setSelectedAvatar] = useState("VIKI");
    const [cursorInModelArea, setCursorInModelArea] = useState(false);
    // Data avatar 
    const Avatar = {
        VIKI: {
            name: "VIKI",
            power: 75,
            penetrate: 30,
            stable: 95,
            portable: 80,
            stars: 3,
            spline: 'https://prod.spline.design/IHaBxxHfiV4tN1x1/scene.splinecode'
        },
        EVA: {
            name: "EVA",
            power: 90,
            penetrate: 50,
            stable: 75,
            portable: 60,
            stars: 4,
            spline: 'https://prod.spline.design/pGvFYSvh7CJL1Z5u/scene.splinecode'
        }
        // TAYLOR: {
        //     name: "TAYLOR",
        //     power: 86,
        //     penetrate: 40,
        //     stable: 95,
        //     portable: 90,
        //     stars: 5,
        //     spline: 'https://prod.spline.design/pGvFYSvh7CJL1Z5u/scene.splinecode'
        // }
    }
    // GET CURRENT AVATAR DATA
    const currentAvatar = Avatar[selectedAvatar];

    const handle3DAreaMouseEnter = () => {
        setCursorInModelArea(true)
    }
    const handle3DAreaMouseLeave = () => {
        setCursorInModelArea(false)
    }
    // handleAvatarChange
    const handleAvatarChange = (newValue) => {
        setSelectedAvatar(newValue);
    };
    return (
        <div className='relative w-full h-screen overflow-hidden mb-[10%]'>
            <CustomCursor isHovering3D={cursorInModelArea} />
            {/* title */}
            <div className="relative z-10 pt-6 text-center">
                <h1 className='text-5xl font-bold font-orbitron tracking-widest md:-mb-14 mb-8' style={{ textShadow: "0 0 10px rgba(255,255,255,0.7)" }}>
                    Chiến Binh
                </h1>
            </div>
            {/* Main content Area */}
            <div className="relative z-10 flex md:flex-row flex-col items-center w-full h-full p-4">
                {/* left */}
                <div className="w-full md:w-2/4 flex flex-col md:ml-10">
                    {/* info card */}
                    <div className="font-rajdhani bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-800 shadow-[0_0_15px_rgba(167, 139, 250, 0.2)]">
                        <h1 className="text-2xl mb-2 font-semibold">{currentAvatar.name}</h1>
                        {/* avatar statistics */}
                        <div className="space-y-3 mb-16">
                            {/* power stat */}
                            <div className="flex items-center">
                                <span className='w-24 text-gray-400'>Sức mạnh</span>
                                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-600 to-white"
                                        style={{ width: `${currentAvatar.power}%` }}></div>
                                </div>
                                <span className='ml-2'>{currentAvatar.power}</span>
                            </div>
                            <div className="flex items-center">
                                <span className='w-24 text-gray-400'>Ổn định</span>
                                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-600 to-white"
                                        style={{ width: `${currentAvatar.stable}%` }}></div>
                                </div>
                                <span className='ml-2'>{currentAvatar.stable}</span>
                            </div>
                            <div className="flex items-center">
                                <span className='w-24 text-gray-400'>Xuyên thấu</span>
                                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-600 to-white"
                                        style={{ width: `${currentAvatar.penetrate}%` }}></div>
                                </div>
                                <span className='ml-2'>{currentAvatar.penetrate}</span>
                            </div>
                            <div className="flex items-center">
                                <span className='w-24 text-gray-400'>Di chuyển</span>
                                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-600 to-white"
                                        style={{ width: `${currentAvatar.portable}%` }}></div>
                                </div>
                                <span className='ml-2'>{currentAvatar.portable}</span>
                            </div>
                        </div>
                        {/* action button */}
                        <div className="flex gap-3">
                            <button className="px-4 py-1 bg-violet-900 text-white
                            rounded-md font-semibold font-orbitron hover:opacity-70 transition-all duration-300">Thanh Tẩy</button>
                            <button className="px-4 py-1 bg-violet-900 text-white
                            rounded-md font-semibold font-orbitron hover:opacity-70 transition-all duration-300">Hồi Sinh</button>
                        </div>
                    </div>
                    {/* Avatar selection cards */}
                    <div className="grid grid-cols-2 gap-4 ">
                        <CardList selectedAvatar={selectedAvatar} Avatar={Avatar} handleAvatarChange={handleAvatarChange}></CardList>
                    </div>
                </div>
                {/* right */}
                <div className="font-orbitron relative md:w-2/4 w-full md:h-full h-80 -z-10 flex items-center justify-center overflow-hidden"
                    onMouseEnter={handle3DAreaMouseEnter}
                    onMouseLeave={handle3DAreaMouseLeave}
                >

                    <AvatarDisplay selectedAvatar={selectedAvatar} Avatar={Avatar} />
                </div>
            </div>
        </div>
    )
}

export default Characters