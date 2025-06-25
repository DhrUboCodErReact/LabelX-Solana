'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { userSignin } from '../../apis/apiFunctions/auth';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { createTask, getTasks, renewTask } from '@/apis/apiFunctions/task';
import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import toast from 'react-hot-toast';
import bs58 from 'bs58';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function UserPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [payment, setPayment] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [renewAmount, setRenewAmount] = useState(0);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [votes, setVotes] = useState<any>({});

  const { publicKey, connected, sendTransaction, signMessage } = useWallet();
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const previewFile = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (token) {
        try {
          const tasks = await getTasks(token);

          if (!Array.isArray(tasks)) {
            console.error('getTasks returned invalid data:', tasks);
            return;
          }

          setUserTasks(tasks);

          const temp: Record<string, number> = {};
          tasks.forEach((task: any) => {
            if (Array.isArray(task.submissions)) {
              task.submissions.forEach((submission: any) => {
                temp[submission.option_id] = (temp[submission.option_id] || 0) + 1;
              });
            }
          });

          setVotes(temp);
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
      }
    };
    fetchTasks();
  }, [token]);

  const signin = async () => {
    const message = 'Please sign to sign in';
    try {
      if (!signMessage) throw new Error('signMessage function is not available');
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const token = await userSignin(publicKey?.toBase58(), bs58.encode(signature), message);
      setToken(token);
    } catch (err) {
      console.error('Error signing message:', err);
    }
  };

  const transferSol = async () => {
    if (!publicKey) {
      toast.error('Please connect wallet');
      return '';
    }

    const lamports = (amount || renewAmount) * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('82oLAu5vM3vjMNBFithiTnF2qxWUYxjgEuAE83Jr1JjL'),
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    try {
      const signature = await sendTransaction(transaction, connection, { minContextSlot });

      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      if (confirmation.value.err) {
        toast.error('Transaction failed');
        return '';
      }

      toast.success('Payment successful');
      return signature;
    } catch (err) {
      toast.error('Transaction error');
      console.error(err);
      return '';
    }
  };

  const submitHandler = async (data: any) => {
    setLoading(true);

    if (!connected) {
      toast.error('Please connect wallet');
      setLoading(false);
      return;
    }

    if (amount === 0 || images.length <= 1) {
      toast.error('Please select number of reviewers and upload at least 2 images');
      setLoading(false);
      return;
    }

    const signature = await transferSol();
    if (!signature) {
      setLoading(false);
      return;
    }

    const formData = {
      title: data.title || 'Untitled',
      payment: signature,
      amount: amount.toString(),
      taskImage: images,
    };

    try {
      const task = await createTask(formData, token!);
      if (task) setUserTasks([...userTasks, task]);
    } catch (err) {
      toast.error('Failed to create task');
      console.error(err);
    }

    setLoading(false);
  };

  const renew = async (taskId: number) => {
    if (renewAmount === 0) {
      toast.error('Please select number of reviewers');
      return;
    }

    const signature = await transferSol();
    if (!signature) return;

    try {
      await renewTask(taskId, renewAmount, token!);
      toast.success('Task renewed!');
    } catch (err) {
      toast.error('Renew failed');
      console.error(err);
    }
  };



  return (
    <div className='flex flex-col items-center gap-20 min-h-screen w-full px-6 py-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-x-hidden overflow-y-auto'>
      <header className='flex w-full max-w-7xl justify-between items-center px-6 py-4 bg-white shadow-lg rounded-lg sticky top-0 z-30'>
        {token ? (
          <WalletMultiButton className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:brightness-110 transition" />
        ) : (
          <button
            className='rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-6 py-2 shadow-md shadow-indigo-300'
            onClick={signin}
          >
            Connect Wallet
          </button>
        )}
        <h1 className='font-extrabold text-3xl text-gray-900 tracking-wide select-none'>Welcome to LabelX</h1>
      </header>

      {token && (
        <form
          onSubmit={handleSubmit(submitHandler)}
          className='flex flex-col gap-8 items-center justify-center w-full max-w-5xl bg-white rounded-xl p-10 shadow-lg ring-1 ring-gray-200'
        >
          <h1 className='text-4xl font-extrabold text-gray-900 mb-6 select-none'>Upload Img For Data Labeling (Recommended 16:9)</h1>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4 select-none'>Select Number of Reviews</h2>

          <div className='flex gap-4 items-center w-full max-w-xl'>
            <input
              type='range'
              step='1'
              max='100'
              onChange={(e) => setAmount(parseInt(e.target.value))}
              defaultValue={0}
              className='w-full accent-indigo-600 cursor-pointer'
            />
            <div className='min-w-[160px] text-right text-indigo-700 font-semibold select-none'>
              {(amount / 0.1).toLocaleString()} people can review
            </div>
          </div>

          <div className='flex flex-col gap-6 w-full max-w-xl'>
            <label htmlFor='title' className='text-lg font-medium text-gray-800 select-none'>
              Enter Title: <span className='text-sm text-gray-400'>(optional)</span>
            </label>
            <input
              type='text'
              id='title'
              className='text-gray-900 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-300 focus:ring-2 p-3 transition'
              defaultValue={'Description For Data Labeling:'}
              {...register('title', { required: true })}
            />

            <input
              type='file'
              onChange={(e) => previewFile(e.target.files)}
              accept='image/*'
              multiple
              className='file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:cursor-pointer file:hover:bg-indigo-700 transition'
            />

            {images.length > 0 && (
              <button
                type='button'
                onClick={(e) => {
                  setImages([]);
                  e.stopPropagation();
                }}
                className='self-start rounded-full bg-red-600 hover:bg-red-700 transition text-white font-semibold px-5 py-2 shadow-md shadow-red-300'
              >
                Clear All Images
              </button>
            )}
          </div>

          {images.length > 0 && (
            <div className='flex flex-wrap gap-6 max-w-5xl w-full justify-center mt-6'>
              {images.map((image, index) => (
                <div
                  key={index}
                  className='relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-200 transform hover:scale-105'
                >
                  <button
                    type='button'
                    aria-label={`Remove image ${index + 1}`}
                    className='absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10'
                    onClick={(e) => {
                      const newImages = images.filter((_, i) => i !== index);
                      setImages(newImages);
                      e.stopPropagation();
                    }}
                  >
                    ×
                  </button>
                  <Image
                    src={image.preview}
                    alt={`Thumbnail ${index + 1}`}
                    width={320}
                    height={180}
                    className='object-cover rounded-lg'
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          )}

          {images.length > 1 && (
            <button
              type='submit'
              disabled={loading}
              className='rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold px-8 py-3 shadow-lg shadow-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition select-none'
            >
              {loading ? 'Processing...' : `Pay ${amount} SOL & Upload`}
            </button>
          )}
        </form>
      )}

      {token && Array.isArray(userTasks) && userTasks.length > 0 && (
        <section className="w-full max-w-6xl bg-white rounded-xl p-8 shadow-xl ring-1 ring-gray-200 mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 select-none">📊 Your Tasks Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTasks.map((task, idx) => (
              <div
                key={idx}
                className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  📌 {task.title || 'Untitled Task'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  👥 Reviewers: <span className="font-semibold text-indigo-600">{task.amount}</span>
                </p>
                <div className="space-y-2">
                  {task.options?.map((option: any, optionIdx: number) => (
                    <div key={optionIdx} className="flex items-center gap-4">
                      <Image
                        src={option.image_url}
                        alt={`Option ${optionIdx + 1}`}
                        width={100}
                        height={56}
                        className="rounded-lg border"
                      />
                      <p className="text-gray-700 font-medium">
                        Votes: <span className="text-indigo-700 font-bold">{votes[option.id] || 0}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
