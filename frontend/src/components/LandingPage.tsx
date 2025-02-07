import { useNavigate } from 'react-router-dom';
const LandingPage = () => {

    const navigate = useNavigate()

    const handleExplore = () => {
      navigate('/new')
    }


  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Grainy texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
      
      {/* Small Red gradient circle - top right */}
      <div className="absolute -top-10 -right-20 w-[400px] h-[200px] bg-red-600/50 rounded-full blur-[80px]"></div>
      
      {/* Small Blue gradient circle - bottom left */}
      <div className="absolute -bottom-10 -left-20 w-[400px] h-[200px] bg-blue-600/50 rounded-full blur-[80px]"></div>
      
      {/* Content container */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-screen text-white text-center px-4">
        <h1 className="text-5xl font-bold mb-6">Modern Platform</h1>
        <p className="text-xl max-w-2xl mb-8">
          Streamlined design meets powerful functionality
        </p>
        <button className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all"
          onClick={handleExplore}>
          Explore
        </button>
      </div>
    </div>
  );
};

export default LandingPage;