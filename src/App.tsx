import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./index.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen pt-[10vh] flex flex-col justify-center text-center">
      <h1 className="text-center text-3xl font-bold">Welcome to Tauri + React</h1>

      <div className="flex justify-center gap-4">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_0.5em_#747bff]" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_0.5em_#24c8db]" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_0.5em_#61dafb]" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          className="mr-1 rounded border border-transparent px-[0.6em] py-[0.6em] text-base font-medium bg-white shadow-[0_2px_2px_rgba(0,0,0,0.2)] transition-colors duration-250 hover:border-[#396cd8] focus:outline-none dark:bg-[#0f0f0f98] dark:text-white"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button
          type="submit"
          className="rounded border border-transparent px-[1.2em] py-[0.6em] text-base font-medium bg-white shadow-[0_2px_2px_rgba(0,0,0,0.2)] transition-colors duration-250 hover:border-[#396cd8] active:border-[#396cd8] active:bg-[#e8e8e8] focus:outline-none cursor-pointer dark:bg-[#0f0f0f98] dark:text-white active:dark:bg-[#0f0f0f69]"
        >
          Greet
        </button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
