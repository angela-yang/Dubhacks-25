import HomeNav from "../components/HomeNav"
import Canvas from "../components/Canvas"
import Background from "../components/Background"
import { FaQuestionCircle } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full h-screen bg-cover bg-center" style={{ backgroundColor: "rgb(88,128,115)"}}>
      <HomeNav />

      <div className="flex flex-col items-center justify-center text-center relative z-5 -translate-y-2">
        <div className="flex items-center justify-center mt-10 px-4">
            <h1 className="text-4xl text-white mr-2">Time to Paint!</h1>
            <button className="text-white rounded-full hover:shadow-2xl cursor-pointer">
                <FaQuestionCircle />
            </button>
        </div>
      </div>

      <Canvas />

      <link rel="icon" href="/images/mt.png" type="image/png" sizes="any" />
    </div>
  )
}
