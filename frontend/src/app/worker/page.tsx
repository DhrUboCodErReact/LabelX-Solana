"use client";

import {
  decrementPendingAmount,
  failedTask,
  getPendingTasks,
  lockamount,
  reviewTask,
} from "@/apis/apiFunctions/task";
import { workerSignin } from "@/apis/apiFunctions/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import React, { useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import bs58 from "bs58";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Page = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [pendingTasks, setPendingTasks] = React.useState<any[]>([]);
  const [renderSteps, setRenderSteps] = React.useState<number>(0);
  const [token, setToken] = React.useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = React.useState<number>(0);
  const [locked, setLocked] = React.useState<boolean>(false);

  const { publicKey, connected, signMessage } = useWallet();

  useEffect(() => {
    const fetchPendingTasks = async () => {
      setLoading(true);
      try {
        const tasks = await getPendingTasks(token);
        setPendingTasks(tasks || []);
        console.log("📦 Tasks fetched:", tasks);
      } catch (err) {
        console.error("Error fetching tasks", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPendingTasks();
  }, [token]);

  const signin = async () => {
    try {
      const message = "Please sign to sign in";
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage!(encodedMessage);
      const workerData = await workerSignin(
        publicKey?.toBase58(),
        bs58.encode(signature),
        message
      );
      setToken(workerData.token);
      setPendingAmount(Number(workerData.pending_amount));
      toast.success("Signed in!");
    } catch (err) {
      console.error("Sign-in error:", err);
      toast.error("Sign-in failed");
    }
  };

  const submitResponse = async (optionId: number) => {
    await reviewTask(pendingTasks[renderSteps].id, optionId, token);
    setPendingAmount((prev) => prev + 0.1);
    setRenderSteps((prev) => prev + 1);
    toast.success("Task reviewed");
  };

  const solPayout = async () => {
    try {
      setLocked(true);
      const toastId = toast.loading("Payout in progress...");
      const connection = new Connection("https://api.devnet.solana.com");

      const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
      if (!privateKey) throw new Error("Private key not set");

      console.log("✅ Private key loaded");
      const secret = bs58.decode(privateKey);
      const sender = Keypair.fromSecretKey(secret);

      console.log("✅ Sender Public Key:", sender.publicKey.toBase58());
      console.log("✅ Receiver Public Key:", publicKey?.toBase58());
      console.log("✅ Payout Amount:", pendingAmount);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey: publicKey!,
          lamports: pendingAmount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = sender.publicKey;
      tx.sign(sender);

      console.log("✅ Transaction signed. Sending...");

      const signature = await connection.sendRawTransaction(tx.serialize());
      console.log("📤 Transaction Signature:", signature);

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        toast.dismiss(toastId);
        console.error("❌ Transaction failed:", confirmation.value.err);
        toast.error("Transaction failed");
        return;
      }

      console.log("✅ Transaction confirmed:", confirmation);

      await decrementPendingAmount(pendingAmount, token);
      setPendingAmount(0);
      toast.success("Payout successful");
      toast.dismiss(toastId);
    } catch (err) {
      toast.error("Payout failed");
      console.error("❌ Error during payout:", err);
    } finally {
      setLocked(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-gray-800">LabelX - Blockchain Data Labeling</h1>
        <div className="flex items-center gap-4">
          {token && (
            <button
              onClick={solPayout}
              disabled={locked}
              className="bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
            >
              Payout {Number(pendingAmount).toFixed(2)} SOL
            </button>
          )}
          {!token && (
            <button
              onClick={signin}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition"
            >
              Connect Wallet
            </button>
          )}
          {token && (
            <WalletMultiButton className="!bg-black !text-white !rounded-full shadow hover:scale-105 transition" />
          )}
        </div>
      </div>

      {/* Wallet Not Connected */}
      {!token && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Welcome to Labify</h2>
          <p className="text-lg text-gray-600 mb-2">
            LabelX is a blockchain-based data labeling platform where workers earn SOL tokens by reviewing tasks.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Connect your Solana wallet to begin and start earning today.
          </p>
          <WalletMultiButton className="!bg-black !text-white !rounded-full" />
        </div>
      )}

      {/* No Tasks */}
      {token && (!pendingTasks || renderSteps >= pendingTasks.length) && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Tasks Available</h2>
          <p className="text-gray-600 max-w-xl">
            You’ve completed all available data labeling tasks. Please check back later or refresh to see if new tasks
            are available. You can still claim your earned SOL reward using the Payout button above.
          </p>
        </div>
      )}

      {/* Show Task */}
      {token && pendingTasks.length > 0 && renderSteps < pendingTasks.length && (
        <div className="flex flex-col items-center w-full gap-7 mt-10">
          <h2 className="text-2xl font-semibold text-center">
            {pendingTasks[renderSteps].title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pendingTasks[renderSteps].options.map((option: any) => (
              <div
                key={option.option_id}
                className="cursor-pointer"
                onClick={() => submitResponse(option.id)}
              >
                <Image
                  src={option.image_url}
                  alt="option"
                  width={300}
                  height={200}
                  className="rounded shadow-md hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
          <p className="text-lg font-medium text-gray-600">Click on an image to label</p>
        </div>
      )}
    </div>
  );
};

export default Page;
