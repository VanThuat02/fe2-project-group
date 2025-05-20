import React from 'react'

const Hero = () => {
    return (
        <main className='relative w-full h-screen overflow-hidden flex justify-center mb-[10%]'>
            <video src="public\videos\hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                className='w-full h-[95%] object-cover absolute top-0 first-letter:left-0 -z-10'
            ></video>
            <div className="absolute bottom-[15%] flex flex-col items-center gap-5">
                <img src="public/images/illu-text.png" alt="Illu-text" className='md:w-[30rem] w-[20rem]' />
                <h1 className='md:text-2xl text-1xl font-bold'>Khám Phá, Chiến Đấu , Chinh Phục</h1>
                <div className="md:w-[75%] w-[60%] h-[0.1px] bg-[#baba]"></div>
                <button className="font-orbitron h-8 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg font-medium text-nowrap hover:opacity-70">
                    CHƠI NGAY
                </button>
                <div className="flex flex-col items-center font-extrabold">
                    <img className='md:h-16 h-12' src="public/images/illu-logo.png" alt="Illu-logo" />
                    <span>
                        Zero
                    </span>
                </div>
                <p className='font-rajdhani max-w-[80%] text-center text-[#babaff]'>
                    THÔNG BÁO: Illuvium Games đang trong giai đoạn thử nghiệm (Beta). Tham gia có thể gặp rủi ro. Vui lòng đọc kỹ điều khoản của chúng tôi tại đây.
                </p>
            </div>
            <div className="absolute bottom-40 ls:right-24 right-5 mt-24 animate-bounce sm:inline-block hidden">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-12 border-[#babaff] border-2 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-[#babaff] rounded-full animate-pulse"></div>
                    </div>
                    <p className='text-[#babaff] mt-2'>Cuộn xuống</p>
                </div>
            </div>
        </main>
    )
}

export default Hero