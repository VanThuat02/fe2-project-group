import React, { useState } from 'react';
// import React from "react";
import { Star } from "lucide-react"
const CardList = ({ Avatar,selectedAvatar, handleAvatarChange}) => {
    const toggleArea = (value)=>{
        handleAvatarChange(value)
    }
    return (
        <>
            {Object.entries(Avatar).map((item, index) => (
                <div onClick={() => toggleArea(item[0])} key={index} className=" relative bg-gray-900/70 backdrop-blur-sm rounded-lg p-3 border 
                flex lg:flex-row flex-col flex-1 
                justify-between px-12 items-center cursor-pointer transition-all duration-300">
                    <div className="text-lg mb-2">{item[1].name}</div>
                    <div className="bg-gray-800/50 w-20 h-20 rounded-md flex justify-center items-center mb-2">
                        <img src={"public/images/" + item[1].name + ".png"} alt="" className="" />
                    </div>
                    {/* star rating */}
                    <div className="flex ">
                        {[...Array(item[1].stars)].map((_, i) => (
                            <Star key={i} className='w-4 h-4 fill-violet-400 text-violet-500' />
                        ))}
                    </div>
                    {/* hightlight */}
                    {selectedAvatar === item[1].name && (
                            <div className="absolute inset-0 border-2 rounded-lg pointer-events-none"></div>
                        )}
                </div>
            ))}

        </>
    )
}
export default CardList
