import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { HomeNavbar } from "@/components/HomeNavbar";

export const Home= () => {
    const navigate = useNavigate();
    return(
        <div>
            <HomeNavbar />
                <div className="min-h-screen max-h-3xl text-black flex items-center justify-center font-fanwood bg-[#fee9c3]">
                <div>
                    <div className="text-7xl font-fanwood">
                        Find What’s <span >Lost</span>, <span> Return What’s Found</span>
                    </div>
                    <div className="text-center font-fanwood text-2xl">
                        Connecting people to reunite lost belongings with their rightful owners.
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-8">
                        <button
                            onClick={() => navigate('report-lost')}
                            className="w-[150px] p-0 border-none origin-center font-fanwood text-[15px] cursor-pointer pb-[3px] rounded-md shadow-[0_2px_0_#494a4b] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bg-black active:translate-y-[5px] active:pb-0 focus:outline-none"
                        >
                            <span className="block bg-black text-white px-4 py-2 rounded-md border-2 border-[#494a4b]">
                            Report Lost Item
                            </span>
                        </button>

                        <button
                            onClick={() => navigate('report-found')}
                            className="w-[150px] p-0 border-none origin-center font-fanwood text-[15px] cursor-pointer pb-[3px] rounded-md shadow-[0_2px_0_#494a4b] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bg-black active:translate-y-[5px] active:pb-0 focus:outline-none"
                        >
                            <span className="block bg-black text-white px-4 py-2 rounded-md border-2 border-[#494a4b]">
                            Report Found Item
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}