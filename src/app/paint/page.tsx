import HomeNav from "../components/HomeNav"
import Canvas from "../components/Canvas"

export default function Home() {
  return (
    <div className="w-full h-screen bg-cover bg-center" style={{ backgroundColor: "rgb(58,87,86)"}}>
      <HomeNav />
      <div className="flex flex-col items-center justify-center text-center relative z-5 -translate-y-2">
        <div className="inline-block relative px-4 mt-10">
            <h1 className="text-4xl text-white"> Time to Paint! </h1>
        </div>
      </div>

      <Canvas />

      <link rel="icon" href="/images/mt.png" type="image/png" sizes="any" />
    </div>
  )
}
