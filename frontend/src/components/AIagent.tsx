import PlaceholdersAndVanishInputDemo from "./PlaceholdersAndVanishInput"

const AIagent = () => {
  return (
    <div className="w-screen h-screen flex justify-center bg-zinc-950">
        <div className="w-[700px] h-screen bg-zinc-900 opacity-100 flex flex-col">
            <div className="text-center w-full h text-6xl text-zinc-700 top-20 mt-28">
                Good Evening, User!
            </div>
            <div className="text-center text-2xl text-zinc-700 mt-10">Ask FlashFi anything</div>
            <div className="w-full mt-10">
                <PlaceholdersAndVanishInputDemo />
            </div>

        </div>
    </div>
  )
}

export default AIagent