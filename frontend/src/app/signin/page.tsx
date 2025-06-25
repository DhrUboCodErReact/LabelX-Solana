import React from 'react';
import Link from 'next/link';

const Signin = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 bg-gradient-to-tr from-purple-900 via-indigo-900 to-black px-6 py-12 text-white font-sans">
      
      {/* Left: Buttons and Heading */}
      <div className="flex flex-col gap-10 w-full max-w-sm">
        <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
          Welcome to LabelX
        </h1>
        <p className="text-lg text-indigo-300 mb-8">
          Choose your role to get started with our data labeling platform powered by Solana blockchain.
        </p>
        <Link href={'/worker'}>
  <button
    className="
      relative
      inline-flex
      justify-center
      items-center
      gap-2
      rounded-3xl
      py-4
      px-10
      bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-700
      text-white
      font-semibold
      shadow-xl
      shadow-pink-600/70
      transition
      duration-300
      ease-in-out
      hover:scale-105
      hover:shadow-pink-700/90
      focus:outline-none
      focus:ring-4
      focus:ring-pink-400/60
      active:scale-95
      overflow-hidden
    "
    aria-label="Go to Worker"
  >
    {/* Glow Layer */}
    <span
      aria-hidden="true"
      className="
        absolute
        inset-0
        rounded-3xl
        bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700
        opacity-0
        hover:opacity-50
        transition-opacity
        duration-500
        blur-[12px]
        pointer-events-none
      "
    ></span>

    {/* Shine/Gloss */}
    <span
      aria-hidden="true"
      className="
        absolute
        top-0
        left-[-75%]
        w-[150%]
        h-full
        bg-gradient-to-r from-white/40 via-white/10 to-white/0
        transform -rotate-12
        pointer-events-none
        animate-shine
      "
    ></span>

    Worker
  </button>
</Link>

<Link href={'/user'}>
  <button
    className="
      relative
      inline-flex
      justify-center
      items-center
      gap-2
      rounded-3xl
      py-4
      px-10
      bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-700
      text-white
      font-semibold
      shadow-xl
      shadow-pink-600/70
      transition
      duration-300
      ease-in-out
      hover:scale-105
      hover:shadow-pink-700/90
      focus:outline-none
      focus:ring-4
      focus:ring-pink-400/60
      active:scale-95
      overflow-hidden
    "
    aria-label="Go to User"
  >
    {/* Glow Layer */}
    <span
      aria-hidden="true"
      className="
        absolute
        inset-0
        rounded-3xl
        bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700
        opacity-0
        hover:opacity-50
        transition-opacity
        duration-500
        blur-[12px]
        pointer-events-none
      "
    ></span>

    {/* Shine/Gloss */}
    <span
      aria-hidden="true"
      className="
        absolute
        top-0
        left-[-75%]
        w-[150%]
        h-full
        bg-gradient-to-r from-white/40 via-white/10 to-white/0
        transform -rotate-12
        pointer-events-none
        animate-shine
      "
    ></span>

    User
  </button>
</Link>

      </div>

      {/* Right: Info panel */}
      <div className="max-w-lg bg-indigo-800 bg-opacity-70 rounded-2xl p-8 shadow-xl text-indigo-100">
        <h2 className="text-2xl font-bold mb-4 border-b border-indigo-400 pb-2">
          About Data Labeling & Solana
        </h2>
        <p className="mb-4 leading-relaxed">
          Data labeling is the process of annotating data to train machine learning models. Accurate labels improve AI performance.
        </p>
        <p className="mb-4 leading-relaxed">
          Our platform leverages <span className="font-semibold">Solana blockchain</span> to ensure transparent and secure task assignments and payments.
        </p>
        <p className="leading-relaxed italic text-indigo-300">
          Connect your wallet, upload images, and get tasks reviewed by trusted contributors. Payments are seamless, instant, and secure on Solana.
        </p>
      </div>
    </div>
  );
};

export default Signin;
