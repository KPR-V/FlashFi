import PlaceholdersAndVanishInputDemo from "./PlaceholdersAndVanishInput"
import CreateWalletButton from "./CreateWalletButton"
import WalletIcon from "./WalletIcon"
const AIagent = () => {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
       <div className="absolute inset-0 opacity-10 pointer-events-none z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
      
      {/* Small Red gradient circle - top right */}
      <div className="absolute -top-10 -right-20 w-[400px] h-[200px] bg-red-600/50 rounded-full blur-[80px]"></div>
      
      {/* Small Blue gradient circle - bottom left */}
      <div className="absolute -bottom-10 -left-20 w-[400px] h-[200px] bg-blue-600/50 rounded-full blur-[80px]"></div>
      

    // content
    <div className="w-screen h-screen flex justify-center bg-zinc-950 overflow-hidden">
      <div className="w-[700px] h-screen bg-zinc-900 opacity-100 flex flex-col">
        <div className="absolute top-10 text-white ">
          <WalletIcon/>
        </div>
            <div className="text-center w-full h text-6xl text-zinc-700 top-20 mt-28">
                Good Evening, User!
            </div>
            <div className="text-center text-2xl text-zinc-700 mt-10">Ask FlashFi anything</div>
            <div className="w-full mt-10">
          <PlaceholdersAndVanishInputDemo />
          
            </div>
        <div className="mt-20">
          <CreateWalletButton/>
</div>
        </div>
    </div>
    </div>
  )
}

export default AIagent