import boxicons from "boxicons"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css'
import React from "react"
import Arena from "./Arena";
import Characters from "./Characters";
const Header = () => {
    //function toggle hidden the mobile menu
    const toggleMobileMenu = () => {
        //get the menu mobile
        const mobileMenu = document.querySelector("#mobileMenu")
        console.log('alo');
        if (mobileMenu) {
            console.log(mobileMenu.innerHTML);

            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden')
            } else {
                mobileMenu.classList.add('hidden')
            }
        }
    }
    return (
        <header className="py-1 px-7 flex justify-between items-center top-0 z-50 w-full border-b-[0.3px] border-[#babaff] bg-black sticky">


            <div className="flex lg:gap-14 gap-4 items-center">
                <img className="md:w-16 w-12" src="public/images/logo.png" alt="logo-img" />
                <div className="font-orbitron hidden md:flex gap-5 items-center">
                    <button className="h-8 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg font-medium text-nowrap hover:opacity-70">
                        CHƠI NGAY
                    </button>
                    <button className="h-8 px-6 bg-gradient-to-r from-gray-600 to-gray-400 rounded-lg font-medium text-nowrap hover:opacity-70">
                        CHƠI NGAY
                    </button>
                </div>
            </div>

            {/* right section desktop */}
            <nav className="hidden md:flex lg:gap-8 gap-4 font-orbitron">
                <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                    < i className='bx  bx-user-circle'  ></i>
                    Avatar
                </a>
                <a to="/Arena" href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                    < i className='bx  bx-diamond'  ></i>
                    Đấu trường
                </a>
                <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                    < i className='bx  bx-chevrons-up'  ></i>
                    Khám phá
                </a>
                <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                    < i className='bx  bx-store-alt'  ></i>
                    Cửa hàng
                </a>
            </nav>
            {/* mobile menu */}
            <button className="text-3xl p-2 md:hidden" onClick={toggleMobileMenu}>
                < i className='bx  bx-menu'  ></i>
            </button>
            {/* mobile menu hidden */}
            <div id="mobileMenu" className="fixed top-20 right-0 left-0 bg-black p-5 md:hidden hidden">
                <nav className="flex flex-col gap-4 items-center">
                    <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                        < i className='bx  bx-user-circle'  ></i>
                        Avatar
                    </a>
                    <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                        < i className='bx  bx-diamond'  ></i>
                        Arena
                    </a>
                    <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                        < i className='bx  bx-chevrons-up'  ></i>
                        Beyond
                    </a>
                    <a href="" className="relative py-1 text-lg hover:text-purple-300 transition-colors duration-300 
                after:content[''] after:absolute after:w-0 after:h-0.5 after:bg-purple-400 after:left-0 after:bottom-0 
                after:transition-all hover:after:w-full text-nowrap">
                        < i className='bx  bx-store-alt'  ></i>
                        Shop
                    </a>
                </nav>
                <div className="flex flex-col gap-3 w-full mt-4 ">
                    <button className="bg-purple-700 py-2 rounded">
                        CHƠI NGAY
                    </button>
                    <button className="bg-gray-500 py-2 rounded">

                        CỬA HÀNG NFT
                    </button>
                </div>
            </div>

        </header>
    )
}
export default Header