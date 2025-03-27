import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden transition-colors duration-300 bg-gradient-to-tr from-green-400 to-green-800 dark:bg-black dark:bg-gradient-to-tr dark:from-black dark:to-green-900">
      <header>
        <Navbar />
      </header>
    </div>
  );
}
