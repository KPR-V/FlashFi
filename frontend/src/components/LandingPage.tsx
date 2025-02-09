import { useState, useEffect } from 'react';
import PlaceholdersAndVanishInputDemo from "./PlaceholdersAndVanishInput"
import CreateWalletButton from "./CreateWalletButton"
import { HiOutlineSparkles } from "react-icons/hi2";
import Logo from "../../Images/FlashFiLogo.png"



const Landingpage = () => {

  const [showButtonShadow, setShowButtonShadow] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
    


      {/* content */}
      <div className="w-screen h-full overflow-hidden flex justify-center items-center">
        <div className="h-full lg:w-[700px]  sm:w-[400px] md:w-[500px] w-[90%] mx-auto flex flex-col">
            {/* Project title */}
            <div className="w-full h-[350px] flex-flex-col items-center justify-center py-24">
                  <div className="typewriter-div   lg:px-20 md:px-16 sm:px-16">
                <div className="typewriter-text px-5 text-9xl sm:text-7xl md:text-8xl lg:text-9xl font-telma font-medium bg-gradient-to-br from-pink-500 to-gray-100 from-[0%] to-[95%] text-transparent bg-clip-text">
                       FlashFi
                </div>
                </div>
                <div className="text-white text-center mt-14 font-CabinetGrotesk text-2xl">
                {greeting}, User!
                </div>
            </div>
            {/* Input Field */}
            <div >
                  <PlaceholdersAndVanishInputDemo /> 
            </div>
            {/* Info */}
            <div className="w-[580px] h-[100px] mx-auto flex items-start justify-start rounded-xl mt-10">
            <div className="w-5 ml-6 mt-3 h-20 text-pink-300  text-2xl absolute"><HiOutlineSparkles />
            </div>
            <div className="text-white opacity-70 absolute ml-14 mt-6 font-CabinetGrotesk font-light">
            DeFi's Next Frontier: AI-Powered Insights
            Backed by Revolutionary <br /> Server Wallet Technology. 
            <span className="underline hover:cursor-pointer text-pink-300"
                  onClick={() => setShowButtonShadow(true)}>Try it now</span> 
            </div>


            <div className="w-[580px] h-[100px] border-[0.01px] border-t-0 border-r-0 border-l-0 border-b-[1px]  border-pink-300 rounded-xl mx-auto opacity-60">
            <div className="w-[580px] h-[100px] border-[0.1px] border-pink-400 rounded-xl shadow-inside opacity-30 mx-auto">
            </div>
            </div>
            </div>
        </div>
        <div className={`bg-transparent text-pink-400 border-[1px] border-pink-300  py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline absolute top-6 right-6 transition-all duration-300 ${showButtonShadow ? 'shadow-glow' : ''}`}><CreateWalletButton/></div>
        <img src={Logo} alt="" className='absolute top-6 left-8 w-16' />
      </div>


    </div>
  )
}

export default Landingpage