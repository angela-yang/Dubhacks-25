import HomeNav from "./components/HomeNav"
import Background from "./components/Background"

export default function Home() {
  return (
    <div className="w-full h-screen bg-cover bg-center" style={{ backgroundColor: "rgb(58,87,86)"}}>
      <HomeNav />
      <Background />
      <div className="w-full flex flex-col justify-center text-center absolute mt-50 z-5">
        <h1 className="text-4xl bold text-white"> Paint-a-Hike </h1>
        <br/>
        <h3 className="text-3xl text-white">Bring your dream hike to life!</h3>
      </div>
      <link rel="icon" href="/images/mt.png" type="image/png" sizes="any" />
    </div>
  )
}
