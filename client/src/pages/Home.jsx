import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export const Home= () => {
    const navigate = useNavigate();
    return(
        <div className="min-h-screen max-h-3xl bg-[#09090b] text-white flex items-center justify-center font-fanwood bg-black">
            <div>
                <div className="text-7xl font-fanwood">
                    Find What’s <span >Lost</span>, <span> Return What’s Found</span>
                </div>
                <div className="text-center font-fanwood text-2xl">
                    Connecting people to reunite lost belongings with their rightful owners.
                </div>
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button className="bg-white text-black text-lg cursor-pointer hover:bg-white" onClick = {() => {
                        navigate('report-lost')
                    }}>Report Lost Item</Button>
                    <Button className="bg-white text-black text-lg cursor-pointer hover:bg-white" onClick = {()=> {
                        navigate('report-found')
                    }}>Report Found Item</Button>     
                </div>
            </div>
        </div>
    )
}